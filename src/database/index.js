import Sequelize from 'sequelize'
import dbConfig from '../config/database'

import File from '../app/models/File'
import User from '../app/models/User'

const models = [File, User]

class Database {
  constructor() {
    this.init()
  }

  init() {
    this.connection = new Sequelize(dbConfig)

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models))
  }
}

export default new Database()
