When I am logging in with the email id  the screen changes and keeps on showing the Rendering... 

and the Console shows these error/warnings 
clerk.browser.js:18  POST https://feasible-duckling-86.clerk.accounts.dev/v1/client/sign_ins?__clerk_api_version=2025-11-10&_clerk_js_version=6.8.0&__clerk_db_jwt=dvb_3DJg4mOwVra8PMha3eyChhzxzcM 400 (Bad Request)
tn.retryImmediately @ clerk.browser.js:18
tn @ clerk.browser.js:16
o @ clerk.browser.js:18
await in o
_baseFetch @ clerk.browser.js:17
(anonymous) @ clerk.browser.js:17
execute @ clerk.browser.js:17
_fetch @ clerk.browser.js:17
_baseMutate @ clerk.browser.js:18
_basePost @ clerk.browser.js:18
create @ clerk.browser.js:18
eh @ signin_ui_ad69ce_1.7.0.js:1
eg @ signin_ui_ad69ce_1.7.0.js:1
d @ ui-common_ui_ad69ce_1.7.0.js:14
eU @ framework_ui_ad69ce_1.7.0.js:1
eQ @ framework_ui_ad69ce_1.7.0.js:1
(anonymous) @ framework_ui_ad69ce_1.7.0.js:1
re @ framework_ui_ad69ce_1.7.0.js:1
rn @ framework_ui_ad69ce_1.7.0.js:1
(anonymous) @ framework_ui_ad69ce_1.7.0.js:1
oz @ framework_ui_ad69ce_1.7.0.js:1
eR @ framework_ui_ad69ce_1.7.0.js:1
ro @ framework_ui_ad69ce_1.7.0.js:1
nU @ framework_ui_ad69ce_1.7.0.js:1
nO @ framework_ui_ad69ce_1.7.0.js:1
4sign-in/factor-one?r…calhost%3A3000%2F:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
(index):1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received

But when i reload it, successfully returns /editor with the user who was trying to sign-in 

# Thats solved but now when i am trying to logout 

Now I can see it clearly - that "Rendering..." pill in the bottom-left is the Next.js dev mode SSR indicator.

(index):1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received
forward-logs-shared.ts:95 [Fast Refresh] rebuilding
forward-logs-shared.ts:95 [Fast Refresh] done in 487ms
(index):1 The resource http://localhost:3000/_next/static/media/caa3a2e1cccd8315-s.p.16t1db8_9y2o~.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
(index):1 The resource http://localhost:3000/_next/static/media/797e433ab948586e-s.p.0.q-h669a_dqa.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. and says "Rendering..."

 