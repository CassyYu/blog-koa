const Koa = require('koa')
const cors = require('koa2-cors')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const app = new Koa()

const post = require('./routes/post')
const get = require('./routes/get')
const user = require('./routes/user')
const servers = require('./routes/servers')

const tokenUtil = require('./util/token');

// error handler
onerror(app)

// middlewares
app.use(bodyparser())
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(cors())

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// token verify
app.use(async (ctx, next) => {
  const token = ctx.request.headers.token;
  try {
    const decode = tokenUtil.verify(token);
    ctx.user = {
      login: true,
      info: decode
    }
  } catch (error) {
    ctx.user = {
      login: false
    }
  }
  await next()
})

// routes
app.use(post.routes(), post.allowedMethods())
app.use(user.routes(), post.allowedMethods())
app.use(get.routes(), get.allowedMethods())
app.use(servers.routes(), servers.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
