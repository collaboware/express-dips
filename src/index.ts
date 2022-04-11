import { server } from './server'
import { IPSDataSource } from './datasource'

const port = process.env.PORT || 3000

IPSDataSource.initialize()
  .then(() => {
    server.listen(port, () =>
      console.log(`Express ips listening at http://localhost:${port}`)
    )
  })
  .catch((error) => console.log(error))
