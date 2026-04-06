(() => {
	function find_anchor() {
		var $user = $("#toolbar-user").closest("li");
		if ($user.length) {
			return { container: $user.parent(), before: $user };
		}
		var $with_help = $("header .navbar-nav").has(".dropdown-help");
		if ($with_help.length) {
			return { container: $with_help.first(), before: $with_help.first().find(".dropdown-help").first() };
		}
		var $any = $("header .navbar-nav");
		if ($any.length) {
			return { container: $any.last(), before: null };
		}
		var $legacy = $(".navbar-right");
		if ($legacy.length) {
			return { container: $legacy.first(), before: null };
		}
		return null;
	}

	function render_menu(anchor, current_company) {
		if ($("#company-switcher-menu").length) {
			return;
		}
		var $menu = $(
			"<li class=\"nav-item dropdown dropdown-company-switcher\" id=\"company-switcher-menu\">" +
				"<button class=\"btn-reset nav-link dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\">" +
				"<span class=\"company-switcher-label\">Company: All Companies</span>" +
				"</button>" +
				"<div class=\"dropdown-menu dropdown-menu-right\" role=\"menu\"></div>" +
				"</li>"
		);

		if (anchor.before && anchor.before.length) {
			$menu.insertBefore(anchor.before);
		} else {
			anchor.container.prepend($menu);
		}

		var $list = $menu.find(".dropdown-menu");

		function set_label(name) {
			var label = name === "ALL" ? "All Companies" : name;
			$menu.find(".company-switcher-label").text("Company: " + label);
		}

		function add_item(label, value) {
			var $item = $("<a class=\"dropdown-item\" href=\"#\"></a>");
			$item.text(label).on("click", function (e) {
				e.preventDefault();
				frappe.confirm(
					__("This will update your Company User Permissions and reload the page. Continue?"),
					function () {
						frappe.call({
							method: "company_switcher.api.switch_company",
							args: { company: value },
							callback: function () {
								location.reload();
							},
						});
					}
				);
			});
			$list.append($item);
		}

		set_label(current_company || "ALL");
		add_item("All Companies", "ALL");

		frappe.call({
			method: "company_switcher.api.get_companies",
			callback: function (r) {
				(r.message && r.message.companies || []).forEach(function (name) {
					add_item(name, name);
				});
			},
		});
	}

	function init_switcher() {
		if (!frappe.session || !frappe.session.user) {
			return false;
		}
		if (frappe.session.user === "Administrator") {
			return true;
		}
		if ($("#company-switcher-menu").length) {
			return true;
		}

		var anchor = find_anchor();
		if (!anchor) {
			return false;
		}

		frappe.call({
			method: "company_switcher.api.get_current_company",
			callback: function (r) {
				if (r.message && r.message.company) {
					render_menu(anchor, r.message.company);
				}
			},
			error: function () {
				// Do nothing if the user is not permitted.
			},
		});

		return true;
	}

	function boot() {
		if (init_switcher()) {
			return;
		}
		var tries = 0;
		var timer = setInterval(function () {
			tries += 1;
			if (init_switcher() || tries > 20) {
				clearInterval(timer);
			}
		}, 500);
	}

	window.company_switcher_init = init_switcher;
	window.company_switcher_boot = boot;

	if (frappe && frappe.after_ajax) {
		frappe.after_ajax(boot);
	}
	$(document).on("toolbar_setup", boot);
	$(document).ready(boot);

	if (window.frappe && window.frappe.ready) {
		frappe.ready(boot);
	}
	if (frappe && frappe.realtime && frappe.realtime.on) {
		frappe.realtime.on("connect", boot);
	}
})();
