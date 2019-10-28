import * as Yup from 'yup'
import { isBefore, parseISO, startOfHour } from 'date-fns'

import Appointment from '../models/Appointment'
import File from '../models/File'
import User from '../models/User'

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query

    const appointments = await Appointment.findAll({
      attributes: ['id', 'date'],
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      include: [
        {
          as: 'provider',
          model: User,
          attributes: ['id', 'name'],
          include: [
            {
              attributes: ['id', 'path', 'url'],
              as: 'avatar',
              model: File,
            },
          ],
        },
      ],
    })

    return res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date().required(),
      provider_id: Yup.number().required(),
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation failed',
      })
    }

    const { date, provider_id } = req.body

    /**
     * Check if the given _provider id_ points to an actual provider
     */
    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    })

    if (!isProvider) {
      return res.status(401).json({
        error: 'You can only create appointments with providers',
      })
    }

    const hourStart = startOfHour(parseISO(date))

    /**
     * Check for past dates
     */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permitted',
      })
    }

    /**
     * Check date availability
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    })

    if (checkAvailability) {
      return res.status(400).json({
        error: 'Appointment date is not available',
      })
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    })

    return res.json(appointment)
  }
}

export default new AppointmentController()
