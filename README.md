# ChatMatrix

> Matrix style Twitch chat

## Config

| Key        | Description             | Type    | Default | Required |
| ---------- | ----------------------- | ------- | ------- | -------- |
| token      | Twitch app access_token | string  | none    | yes      |
| channel    | Twitch channel name     | string  | none    | yes      |
| color      | Text color (hex code)   | string  | 'F3C'   | no       |
| debug      | Debug markers           | boolean | false   | no       |
| horizontal | Horizontal flow         | boolean | false   | no       |
| size       | Text size               | int     | 30      | no       |

> Example:
>
> ```text
> ChatMatrix.html?token=<your_token>&channel=maks0u__&color=FFF&horizontal=true&size=20
> ```

[Live demo](https://maks0u.github.io/ChatMatrix/ChatMatrix.html?token=null&channel=maks0u__&size=20)
