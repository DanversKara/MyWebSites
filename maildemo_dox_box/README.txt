BearerMail — Demo Site
======================

A static, non-functional demo of BearerMail for maildemo.dox.box.
Everything is fictional. No data is saved, sent, or editable — buttons that
would change something just show a small "demo only" note. Fonts and icons are
bundled locally, so it works offline with no CDN or internet connection.

Pages
-----
  index.html      Demo hub / landing page (start here)
  login.html      Sign-in screen (click Sign in — no password needed)
  mail.html       Inbox — OTP/2FA code with copy banner, doctor + meeting
                  invitations with "Add to calendar", forged-sender warning
  calendar.html   Month view with the imported appointment and meeting
  drive.html      Files, folders, storage quota, password-protected share links
  security.html   Overview tiles, sessions, sign-in history, suspicious IPs, alerts
  share.html      What a recipient sees for a shared file / event (public link)
  assets/         app.css, demo.js, and the bundled icon + Satisfy fonts

How to host at https://maildemo.dox.box
----------------------------------------
Upload the whole folder to any static host / web server and point the domain at
it. index.html is the entry page. No build step, no server code, no database.

Quick local preview:
  cd this-folder
  python3 -m http.server 8000
  open http://localhost:8000

Note: the "maildemo.dox.box" shown in the mock address bar and in share links is
just demo text inside the pages — it does not need to match where you host them.
