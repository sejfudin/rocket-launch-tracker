# Sendgrid Email Provider

## Setup

1. Create a Sendgrid account on [Sendgrid](https://signup.sendgrid.com/)
2. Create a Sendgrid API key [here](https://app.sendgrid.com/settings/api_keys)

> Use one Sendgrid API key per environment

> Grant only the minimum required permissions to send out emails

3. Configure the module

```yaml
email:
  sendgrid:
    apiKey: 'SG.exampleApiKey'
```

4. Inject into AppModule

```typescript
import { Module } from '@nestjs/common';
import { EmailModule } from '~common/email';
import { SendgridEmailModule } from '~common/email/providers/sendgrid';

@Module({
  imports: [EmailModule.forRoot([SendgridEmailModule, PrismaEmailTemplateModule])],
})
export class AppModule {}
```

## Templates

In addition to built in templates, you can also create templates in Sendgrid itself.

See the documentation [here](https://www.twilio.com/docs/sendgrid/ui/sending-email/how-to-send-an-email-with-dynamic-templates).

Use the {{ name }} syntax to pass in variables to the template.

When using the `external` engine, you must provide a `externalTemplate` inside the engineOptions object. This ID refers to the dynamic template configured in your SendGrid dashboard.

```typescript
export const MyEmailTemplate: IEmailTemplate = {
  name: 'MY_EMAIL_TEMPLATE',
  subject: 'Forgot Password: {{code}}',
  engine: 'external',
  engineOptions: {
    externalTemplate: 'd-0000000001',
  },
};
```
