<!-- MUBTKIR-UNIFIED-README-START -->
## مبدّل الشركات السريع | Company Switcher

تطبيق يتيح للمستخدمين التبديل السريع بين الشركات من الشريط العلوي وتطبيق الصلاحيات والفلترة تلقائياً.
* **الفئة المستهدفة:** المجموعات القابضة والشركات متعددة الفروع والكيانات.

Enables instant company switching from the top navbar with automatic filtering and permissions.
* **Target Audience:** Holding groups and multi-company organizations on ERPNext.

### تواصل معنا | Contact & Sales — [مبتكر للأنظمة السحابية | Mubtkir ERP](https://mubtkir.com)

* 🌐 **الموقع الرسمي | Website:** [Mubtkir ERP — حلول ERPNext السحابية](https://mubtkir.com)
* 📧 **البريد الإلكتروني | Email:** [sales@mubtkir.com](mailto:sales@mubtkir.com)
* 📱 **الجوال | Mobile:** [+966547706865](tel:+966547706865)
* 💬 **واتساب | WhatsApp:** [+966126810486](https://wa.me/966126810486)

<!-- MUBTKIR-UNIFIED-README-END -->

### Company Switcher

Company switcher for ERPNext

### Installation

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
cd $PATH_TO_YOUR_BENCH
bench get-app $URL_OF_THIS_REPO --branch develop
bench install-app company_switcher
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/company_switcher
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

mit
