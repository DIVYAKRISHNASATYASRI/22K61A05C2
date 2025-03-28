const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/test',
    createProxyMiddleware({
      target: 'http://20.244.56.144',
      changeOrigin: true,
      headers: {
        'x-client-id': '80760640-37b3-4790-bd8f-be1007785d06',
        'x-client-secret': 'sakEIonERqWAcbcL',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDMxNDg3MjcsImlhdCI6MTc0MzE0ODQyNywiaXNzIjoiQWZmb3JkbWVkIiwianRpIjoiODA3NjA2NDAtMzdiMy00NzkwLWJkOGYtYmUxMDA3Nzg1ZDA2Iiwic3ViIjoiZGl2eWEucGFpYm9udUBzYXNpLmFjLmluIn0.5H7gBlb041z3nBNaD6uL4Hxu8AUaKHjYzFhWr6nBbeE'
      },
      pathRewrite: {
        '^/test': '/test'
      },
      logLevel: 'debug',
      secure: false,
      onProxyRes: function (proxyRes) {
        proxyRes.headers['access-control-allow-origin'] = '*';
      }
    })
  );
};