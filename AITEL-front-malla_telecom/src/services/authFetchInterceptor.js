// La mayoria de los archivos en src/services/**/*.js llaman a fetch('/api/...')
// directamente sin adjuntar el token JWT (quedaron asi de cuando el front
// corria contra datos simulados). Envolver fetch una sola vez aqui evita
// tener que tocar cada uno de esos archivos por separado para agregar el
// header Authorization.
const nativeFetch = window.fetch.bind(window);

window.fetch = (input, init = {}) => {
  const rawUrl = typeof input === 'string' ? input : input.url;

  let pathname;
  try {
    pathname = new URL(rawUrl, window.location.origin).pathname;
  } catch {
    pathname = rawUrl;
  }

  if (!pathname.startsWith('/api/')) {
    return nativeFetch(input, init);
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    return nativeFetch(input, init);
  }

  const headers = new Headers(init.headers ?? (typeof input === 'object' ? input.headers : undefined));
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return nativeFetch(input, { ...init, headers });
};
