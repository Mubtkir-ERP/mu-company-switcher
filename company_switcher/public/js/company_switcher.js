(() => {
	function find_anchor() {
		// nxt_theme support
		var $nxt_help = $('.help_switcher').closest('.dropdown');
		if (!$nxt_help.length) {
			$nxt_help = $('[data-lucide="help-circle"]').closest('.dropdown');
		}
		
		if ($nxt_help.length) {
			return { container: $nxt_help.parent(), before: $nxt_help, isNxt: true };
		}

		// Frappe default
		var $user = $("#toolbar-user").closest("li");
		if ($user.length) {
			return { container: $user.parent(), before: $user, isNxt: false };
		}
		var $with_help = $("header .navbar-nav").has(".dropdown-help");
		if ($with_help.length) {
			return { container: $with_help.first(), before: $with_help.first().find(".dropdown-help").first(), isNxt: false };
		}
		var $any = $("header .navbar-nav");
		if ($any.length) {
			return { container: $any.last(), before: null, isNxt: false };
		}
		var $legacy = $(".navbar-right");
		if ($legacy.length) {
			return { container: $legacy.first(), before: null, isNxt: false };
		}
		return null;
	}

	function render_menu(anchor, current_company) {
		if ($("#company-switcher-menu").length || $("#company-switcher-dropdown").length) {
			return;
		}

		var $menu;
		
		if (anchor.isNxt) {
			// nxt_theme (Tailwind)
			$menu = $(`
				<div data-tw-merge="" data-tw-placement="bottom-end" class="dropdown relative ml-3" id="company-switcher-dropdown">
					<a data-tw-toggle="dropdown" class="p-2 rounded-full hover:bg-slate-100 cursor-pointer" href="javascript:;" title="Company Switcher">
						<i data-lucide="building-2" class="stroke-[1] h-[18px] w-[18px]"></i>
					</a>
					<div data-transition="" data-selector=".show" data-enter="transition-all ease-linear duration-150" data-enter-from="absolute !mt-5 invisible opacity-0 translate-y-1" data-enter-to="!mt-1 visible opacity-100 translate-y-0" data-leave="transition-all ease-linear duration-150" data-leave-from="!mt-1 visible opacity-100 translate-y-0" data-leave-to="absolute !mt-5 invisible opacity-0 translate-y-1" class="dropdown-menu tw-dropdown-menu absolute z-[9999] company_switcher">
						<div data-tw-merge="" class="dropdown-content rounded-md border-transparent bg-white p-2 shadow-[0px_3px_10px_#00000017] dark:border-transparent dark:bg-darkmode-600 w-56 mt-1 company-list-container">
						</div>
					</div>
				</div>
			`);
		} else {
			// Frappe default (Bootstrap)
			$menu = $(
				"<li class=\"nav-item dropdown dropdown-company-switcher\" id=\"company-switcher-menu\">" +
					"<button class=\"btn-reset nav-link dropdown-toggle\" data-toggle=\"dropdown\" role=\"button\">" +
					"<span class=\"company-switcher-label\">Company: All Companies</span>" +
					"</button>" +
					"<div class=\"dropdown-menu dropdown-menu-right company-list-container\" role=\"menu\"></div>" +
					"</li>"
			);
		}

		if (anchor.before && anchor.before.length) {
			$menu.insertBefore(anchor.before);
		} else {
			anchor.container.prepend($menu);
		}

		// تفعيل الأيقونات لـ nxt_theme
		if (anchor.isNxt && window.createIcons && window.icons) {
			setTimeout(function() {
				window.createIcons({ icons: window.icons });
			}, 100);
		}

		var $list = $menu.find(".company-list-container");

		function set_label(name) {
			var label = name === "ALL" ? "All Companies" : name;
			if (anchor.isNxt) {
				$menu.find('a[data-tw-toggle]').attr('title', "Company: " + label);
			} else {
				$menu.find(".company-switcher-label").text("Company: " + label);
			}
		}

		function add_item(label, value, is_active) {
			var $item;
			if (anchor.isNxt) {
				var active_bg = is_active ? 'bg-slate-100 dark:bg-darkmode-400' : '';
				$item = $(`
					<a class="cursor-pointer flex items-center p-2 transition duration-300 ease-in-out rounded-md hover:bg-slate-200/60 dark:bg-darkmode-600 dark:hover:bg-darkmode-400 dropdown-item ${active_bg}" href="javascript:;">
						<span class="flex-1 text-sm">${label}</span>
						${is_active ? '<i data-lucide="check" class="stroke-[1] h-4 w-4 ml-2"></i>' : ''}
					</a>
				`);
			} else {
				$item = $("<a class=\"dropdown-item\" href=\"#\"></a>").text(label);
			}

			$item.on("click", function (e) {
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
		add_item("All Companies", "ALL", (current_company === "ALL" || !current_company));

		frappe.call({
			method: "company_switcher.api.get_companies",
			callback: function (r) {
				(r.message && r.message.companies || []).forEach(function (name) {
					add_item(name, name, (name === current_company));
				});
				// تحديث الأيقونات بعد إضافة العناصر
				if (anchor.isNxt && window.createIcons && window.icons) {
					setTimeout(function() {
						window.createIcons({ icons: window.icons });
					}, 150);
				}
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
		if ($("#company-switcher-menu").length || $("#company-switcher-dropdown").length) {
			return true;
		}

		var anchor = find_anchor();
		if (!anchor) {
			return false;
		}

		frappe.call({
			method: "company_switcher.api.get_current_company",
			callback: function (r) {
				render_menu(anchor, r.message ? r.message.company : "ALL");
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
