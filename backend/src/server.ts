import { app } from './app'

const PORT = 3333

app.listen({
    port: PORT,
    host: '0.0.0.0',
}).then(() => {
    console.log('HTTP server running on port:', PORT)
}).catch((err) => {
    console.error('Erro ao iniciar servidor:', err)
    process.exit(1)
})
