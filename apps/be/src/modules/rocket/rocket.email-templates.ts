import { Injectable } from '@nestjs/common';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

import { RegisterEmailTemplate } from '~common/email/email.decorators';
import { EmailCompilerType, IEmailData, type IEmailTemplate } from '~common/email/models';

export class RocketLaunchResultEmailTemplateData {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsString()
  result!: string;

  @Expose()
  @IsString()
  message!: string;
}

export const RocketLaunchResultEmailTemplate: IEmailTemplate = {
  name: 'rocket-launch-result',
  engine: EmailCompilerType.MJML,
  subject: 'Rocket {{name}} {{result}}',
  // language=mjml
  html: `
<mjml>
  <mj-body>
    <mj-section>
      <mj-column>

        <mj-image width="100px" src="cid:rocket"></mj-image>

        <mj-divider border-color="#F45E43"></mj-divider>

        <mj-text font-size="20px" color="#F45E43" font-family="helvetica">Rocket {{name}} {{result}}</mj-text>
        <mj-text font-size="14px" color="#333" font-family="helvetica">{{message}}</mj-text>

      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
  `,
  text: 'Rocket {{name}} {{result}}. {{message}}',
  attachments: [
    {
      filename: 'rocket.png',
      contentDisposition: 'INLINE',
      description: 'Rocket',
      contentType: 'image/png',
      contentId: 'rocket',
      // todo this should be a regular file loaded from the filesystem
      data:
        'iVBORw0KGgoAAAANSUhEUgAAAJAAAACSBAMAAABYoF6AAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAHWaVRYdFhNTDp' +
        'jb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2Lj' +
        'AuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+C' +
        'iAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9i' +
        'ZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE0NjwvZXhpZjpQaXhlbFlEaW1lbnNpb24' +
        '+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4xNDQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZj' +
        'pVc2VyQ29tbWVudD5TY3JlZW5zaG90PC9leGlmOlVzZXJDb21tZW50PgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZ' +
        'GY6UkRGPgo8L3g6eG1wbWV0YT4KAoSrnQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA9QTFRF8vX8K1HUk6Tpws3zYXvfRUJsMgAA' +
        'AyhJREFUaN7tWFuWoyAQRXABAVkAZHoBGLOAaNz/miZR3pLuKuwzZz6oLz2J11u3HlRJSLNmzZo1a/Yvjd3Wl13Pwtxnvpv6HRj' +
        'OxRmnAszLTDXOlODUA915auqXcGqB+oCwLlddDUQdilyMhVWn4rUYz68KSFs6U+Soqhda+oh3deGnOU4tkM5xNqBqx2JNxhogtu' +
        'M8Mo6y0rEnOQtES01jrmgjOhf6bfB+9Opgy59A6HFkeUGUqLyanZAglUChFa4h8mxK0ghUIWPaeTZCXy+GKvpdwTMnaar32EUNz' +
        'MeM0NPGKYjOYUA5oahuhddaQAnJqxN8iBrSXvLAoDEXqNtXeNaxeyC0Hr0PNHiTAMFaPwuZM4YcckAXd4Mh9C5Ne5UAwbSOCNHQ' +
        'zhIgDdI6IvS+lKHcvUagYzYitHk2hAbkfqEgicY07bjKkt1eCgwhHT8QZTZIoi4qzfQBnXimQH1VHT2zt0/3rh8l4iFQXSYF/ZL' +
        'Pg8ffSyQKnqXMgMHnQn3OFg2rj5AuH+qAAidj3xtVV/ZshE6ProHxufxAFA0oUlGKnoOPxghJfJtnP9v1MxDFLSH040Q+Iwd1Gh' +
        '0fB4VQ4wzVpbVlnwgeFVPRUDrvquY0c6wfJKESJV1DqEDpXg4AmhKr3mQzSm6tIScp3T/XH4pSf2olDpRYaC3mDCU75IoRu+65Q' +
        'dhSsjjSdMiEfAu7KE/JfTdQm1IXHI5NmLhdDjvwgO5GIl7S9wRiKCAdf2nwN9t6xDCpTZOWTXmyF2NSW6ebg07ScEYARfI+PCVF' +
        'UBO/90xOt2TklxFbgfHM7MU1eOToJRcEkLABkv4IMvjT0f93dkRGVxcU00aCI36365IFCZqPXTKweWyZxw80H11I4hqz8mtUy9Z' +
        'OkCA2mf0Eh+hGfhPrw+t3tXGEiJvTWNiw9pRCEiKursYo9zYvkYTsHm57q8rLD05oe/m0ZofqjP9eTHlW/MnMrOqAZP51FXPs0x' +
        'IhdzxiTrSeF2fjGT2HdJzzw8dLxN5wBEq/qfXowcjFZzWHrDB4oHU5PERX7FAsl6lmbjlmNmnWrFmzZs2aNWv2n9lfzsCLyyIFk' +
        'MEAAAAASUVORK5CYII=',
    },
  ],
};

@Injectable()
export class RocketEmailTemplates {
  @RegisterEmailTemplate({
    validate: RocketLaunchResultEmailTemplateData,
    template: RocketLaunchResultEmailTemplate,
  })
  async rocketLaunchResultTemplate(data: IEmailData<RocketLaunchResultEmailTemplateData>) {
    return data;
  }
}
