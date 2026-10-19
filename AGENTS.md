# Architecture rules
- Camera analysis calls Google directly from a public Cloud edge function (no sign-in, by owner choice); private provider credentials never enter browser code and no Lovable AI Gateway calls are used.
- Share the camera findings contract and fallback data under the function directory so browser and server validate the same fields without deployment imports outside the functions tree.
- Camera analysis walks an ordered list of Google model names inside the function and retries once on overload, because Google retires model names and reports capacity as 503 without notice.