# Architecture rules
- Camera analysis calls Google directly from an authenticated Cloud edge function; private provider credentials never enter browser code and no Lovable AI Gateway calls are used.
- Share the camera findings contract and fallback data under the function directory so browser and server validate the same fields without deployment imports outside the functions tree.