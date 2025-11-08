# Authentication Service

## Default Admin Bootstrapper

When the service starts it now checks whether any employee account with the `ADMIN` role exists. If none can be found, a default administrator account is created automatically using the email address supplied through configuration. A random password is generated, persisted, and emailed to that address.

### Configuration

| Property | Environment variable | Description |
| --- | --- | --- |
| `app.admin.bootstrap-enabled` | `ADMIN_BOOTSTRAP_ENABLED` | Set to `false` to opt out of the automatic bootstrap. |
| `app.admin.email` | `ADMIN_EMAIL` | Email to assign to the auto-created admin account. **Required** when bootstrapping is enabled. |
| `app.admin.mail-from` | `ADMIN_MAIL_FROM` | Optional sender address for the email notification. |
| `app.admin.password-length` | `ADMIN_PASSWORD_LENGTH` | Length of the generated password (minimum enforced length is 12). |

The mail transport uses the standard Spring Boot mail properties (`spring.mail.host`, `spring.mail.port`, etc.), so ensure those values are available in your environment before starting the service.

### Behaviour

1. On startup the bootstrapper queries the `employee_accounts` table for an `ADMIN` role.
2. If an admin already exists, no action is taken.
3. If none exists and the feature is enabled, the service will:
   - generate a secure password,
   - create a new employee account with role `ADMIN` and a sentinel `employee_id`,
   - send the password to the configured email.

Remember to change the temporary password immediately after signing in.
