import knex from '../database/connection';
import { Request, Response } from 'express'

export default class PointsController{
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.15.13:3333/uploads/${point.image}`
      }
    });

    return response.json(serializedPoints);
  }

  async show(request: Request, response:Response) {
    const { id } = request.params;

    const point = await knex('points').where({ id }).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found!'});
    }

    const serializedPoints = {
        ...point,
        image_url: `http://192.168.15.13:3333/uploads/${point.image}`
    };

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({ point: serializedPoints, items });
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = request.body;

    const checkItems = async () => {
      return Promise.all(items
        .split(',')
        .map((item : string) => Number(item.trim()))
        .map(async (id: Number) => {
        const item = await knex('items').where({id});
        if(item.length === 0) {
          return undefined;
        };
        return item;
      }))
    }

    const checkedItems = (await checkItems()).filter(item => item === undefined);

    if (checkedItems.length !== 0) {
      return response.json('Invalid item(s)');
    }

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    }

    const insertedIds = await knex('points').insert(point);

    const point_id = insertedIds[0];

    const pointItems = items
      .split(',')
      .map((item : string) => Number(item.trim()))
      .map((item_id: Number) => {
        return {
          item_id,
          point_id,
        }
      })

    await knex('point_items').insert(pointItems);


    return response.json({
      id: point_id,
      ...point
     });
  }
}
