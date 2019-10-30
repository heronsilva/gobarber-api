import Sequelize, { Model } from 'sequelize'

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            const url = `${process.env.APP_URL}:${process.env.APP_PORT}`

            return `${url}/files/${this.path}`
          },
        },
      },
      {
        sequelize,
      }
    )

    return this
  }
}

export default File
