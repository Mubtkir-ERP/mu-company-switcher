import frappe
from frappe import _

ROLE_NAME = "Company Switcher Manager"
DEFAULT_KEY = "company_switcher_current_company"
ALL_COMPANIES = "ALL"


def _ensure_authorized():
	if frappe.session.user == "Administrator":
		frappe.throw(_("Administrator cannot use Company Switcher."), frappe.PermissionError)
	roles = frappe.get_roles(frappe.session.user)
	if ROLE_NAME not in roles:
		frappe.throw(_("Not permitted"), frappe.PermissionError)


def _delete_company_permissions(user):
	frappe.db.delete("User Permission", {"user": user, "allow": "Company"})


def _set_user_default(user, value):
	name = frappe.db.get_value(
		"DefaultValue", {"parent": user, "defkey": DEFAULT_KEY}, "name"
	)
	if name:
		frappe.db.set_value("DefaultValue", name, "defvalue", value)
		return

	frappe.get_doc(
		{
			"doctype": "DefaultValue",
			"parent": user,
			"parenttype": "User",
			"parentfield": "defaults",
			"defkey": DEFAULT_KEY,
			"defvalue": value,
		}
	).insert(ignore_permissions=True)


def _insert_company_permission(user, company):
	frappe.get_doc(
		{
			"doctype": "User Permission",
			"user": user,
			"allow": "Company",
			"for_value": company,
			"apply_to_all_doctypes": 1,
		}
	).insert(ignore_permissions=True)


@frappe.whitelist()
def get_current_company():
	"""Return current company from user defaults, or ALL."""
	_ensure_authorized()
	user = frappe.session.user
	value = frappe.db.get_value(
		"DefaultValue", {"parent": user, "defkey": DEFAULT_KEY}, "defvalue"
	)
	return {"company": value or ALL_COMPANIES}


@frappe.whitelist()
def get_companies():
	"""Return all companies for the switcher dropdown."""
	_ensure_authorized()
	return {"companies": frappe.get_all("Company", pluck="name", ignore_permissions=True)}


@frappe.whitelist()
def switch_company(company):
	"""Switch company by replacing Company user permissions for current user."""
	_ensure_authorized()
	user = frappe.session.user
	company = (company or "").strip()

	if company and company != ALL_COMPANIES and not frappe.db.exists("Company", company):
		frappe.throw(_("Company not found"))

	_delete_company_permissions(user)

	if company and company != ALL_COMPANIES:
		_insert_company_permission(user, company)
		_set_user_default(user, company)
		frappe.defaults.set_user_default("company", company, user=user)
	else:
		_set_user_default(user, ALL_COMPANIES)
		first_company = frappe.get_all("Company", pluck="name", limit=1, order_by="name")[0]
		frappe.defaults.set_user_default("company", first_company, user=user)

	frappe.clear_cache(user=user)
	return {"company": company or ALL_COMPANIES}
