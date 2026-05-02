#!/usr/bin/env python3
"""Validate the Hermitage portal access/RLS contract.

This is intentionally a deterministic repository test. It does not need a
live Supabase project to catch the dangerous regressions for Sprint 2 PR2:
returning to customers.id = auth.uid(), allowing revoked users, exposing
non-client-visible files, or reopening broad storage reads.
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIGRATION = os.path.join(ROOT, "supabase", "migrations", "00006_client_portal.sql")


def read(path):
    with open(path, encoding="utf-8") as handle:
        return handle.read()


def assert_match(sql, pattern, message):
    if not re.search(pattern, sql, re.IGNORECASE | re.DOTALL):
        raise AssertionError(message)


def assert_not_match(sql, pattern, message):
    if re.search(pattern, sql, re.IGNORECASE | re.DOTALL):
        raise AssertionError(message)


def main():
    if not os.path.isfile(MIGRATION):
        raise AssertionError("00006_client_portal.sql is missing")

    sql = read(MIGRATION)
    executable_sql = re.sub(r"--.*", "", sql)

    checks = [
        (
            r"CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+customer_users\b.*?customer_id\s+uuid\s+NOT\s+NULL.*?user_id\s+uuid\s+NOT\s+NULL.*?revoked_at\s+timestamptz",
            "customer_users must map auth users to customer records and support revocation",
        ),
        (
            r"CREATE\s+OR\s+REPLACE\s+FUNCTION\s+is_customer_user.*?cu\.customer_id\s*=\s*target_customer_id.*?cu\.user_id\s*=\s*auth\.uid\(\).*?cu\.revoked_at\s+IS\s+NULL",
            "is_customer_user must require matching auth user and non-revoked access",
        ),
        (
            r"CREATE\s+OR\s+REPLACE\s+FUNCTION\s+can_access_project.*?JOIN\s+customer_users\s+cu\s+ON\s+cu\.customer_id\s*=\s*p\.customer_id.*?cu\.user_id\s*=\s*auth\.uid\(\).*?cu\.revoked_at\s+IS\s+NULL",
            "can_access_project must join through customer_users and deny revoked users",
        ),
        (
            r'CREATE\s+POLICY\s+"customer_users_self_read".*?FOR\s+SELECT\s+USING\s*\(\s*user_id\s*=\s*auth\.uid\(\)\s+AND\s+revoked_at\s+IS\s+NULL\s*\)',
            "clients may only read their own active customer_users rows",
        ),
        (
            r'CREATE\s+POLICY\s+"projects_portal_read".*?FOR\s+SELECT\s+USING\s*\(\s*can_access_project\(id\)\s*\)',
            "project reads must be scoped by can_access_project",
        ),
        (
            r'CREATE\s+POLICY\s+"project_files_portal_read".*?FOR\s+SELECT\s+USING\s*\(\s*is_client_visible\s+AND\s+can_access_project\(project_id\)\s*\)',
            "project file reads must require client-visible files and project access",
        ),
        (
            r'CREATE\s+POLICY\s+"project_documents_portal_read".*?FOR\s+SELECT\s+USING\s*\(\s*is_client_visible\s+AND\s+can_access_project\(project_id\)\s*\)',
            "project documents must require visible documents and project access",
        ),
        (
            r'CREATE\s+POLICY\s+"invoices_portal_read".*?FOR\s+SELECT\s+USING\s*\(\s*is_client_visible\s+AND\s+can_access_project\(project_id\)\s*\)',
            "invoices must require visible records and project access",
        ),
        (
            r'CREATE\s+POLICY\s+"client_file_selections_portal_insert".*?FOR\s+INSERT\s+WITH\s+CHECK\s*\(\s*user_id\s*=\s*auth\.uid\(\)\s+AND\s+can_access_project\(project_id\)\s*\)',
            "selection inserts must bind to the current user and accessible project",
        ),
        (
            r'CREATE\s+POLICY\s+"customer_storage_read_visible_project_files".*?pf\.r2_key\s*=\s*storage\.objects\.name.*?pf\.is_client_visible\s*=\s*true.*?public\.can_access_project\(pf\.project_id\)',
            "storage reads must be mediated by visible project_files records",
        ),
    ]

    for pattern, message in checks:
        assert_match(sql, pattern, message)

    assert_not_match(
        executable_sql,
        r"customer_id\s*=\s*auth\.uid\(\)|customers\.id\s*=\s*auth\.uid\(\)|projects\.customer_id\s*=\s*auth\.uid\(\)",
        "portal policy executable SQL must not return to customers.id = auth.uid() assumptions",
    )
    assert_not_match(
        executable_sql,
        r'CREATE\s+POLICY\s+"authenticated_read"',
        "authenticated_read storage policy must stay dropped, not recreated",
    )

    matrix = {
        "anonymous": "auth.uid() is null, so no customer_users row can match",
        "invited_client": "matching customer_users row with revoked_at null can read project-visible rows",
        "other_client": "customer_users joins by project.customer_id, so another customer is denied",
        "revoked_client": "revoked_at is null predicates deny access after revocation",
        "admin": "is_admin policies retain studio operational access",
    }
    print("Portal access/RLS contract passed")
    for actor, expectation in matrix.items():
        print(f"- {actor}: {expectation}")


if __name__ == "__main__":
    try:
        main()
    except AssertionError as error:
        print(f"Portal access/RLS contract failed: {error}", file=sys.stderr)
        sys.exit(1)
