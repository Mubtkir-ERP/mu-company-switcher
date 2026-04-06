import frappe

ROLE_NAME = "Company Switcher Manager"


def ensure_role():
	if not frappe.db.exists("Role", ROLE_NAME):
		frappe.get_doc({"doctype": "Role", "role_name": ROLE_NAME}).insert()


def after_install():
	ensure_role()
