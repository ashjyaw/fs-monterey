import { NewProduct, Product, ProductStat, AttributeValueArg } from './schema';
import { pool } from '../db';

export class ProductService {
  public async list(
    id?: string,
    username?: string,
    category?: string,
  ): Promise<Product[]> {
    if (category) {
      const select = `
        WITH RECURSIVE category_tree AS (
          SELECT slug, parent_slug
          FROM category
          WHERE slug = $1
          UNION ALL
          SELECT c.slug, c.parent_slug
          FROM category_tree ct
          JOIN category c ON ct.slug = c.parent_slug
        )
        SELECT p.data || jsonb_build_object(
          'id', p.id,
          'user', p.member_username,
          'category', p.category_slug,
          'attributes', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
              'id', attribute_id,
              'name', (attribute.data ->> 'name'),
              'value', (attribute_value.data ->> 'value'),
              'symbol', (attribute.data ->> 'symbol')
            )) FROM attribute_value
            JOIN attribute ON attribute_value.attribute_id = attribute.id
            WHERE product_id = p.id
          ), '[]'::jsonb)
        ) AS product
        FROM product p
        JOIN category_tree ct ON p.category_slug = ct.slug
      `;
      const values = [category];
      const query = {
        text: select,
        values: values,
      };
      const { rows } = await pool.query(query);
      return rows.map(row => row.product);
    }
    let select = `
      SELECT data || jsonb_build_object(
        'id', id,
        'user', member_username,
        'category', category_slug,
        'attributes', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', attribute_id,
            'name', (attribute.data ->> 'name'),
            'value', (attribute_value.data ->> 'value'),
            'symbol', (attribute.data ->> 'symbol')
          )) FROM attribute_value
          JOIN attribute ON attribute_value.attribute_id = attribute.id
          WHERE product_id = product.id
        ), '[]'::jsonb)
      ) AS product FROM product
    `;
    let values: string[] = [];
    if (id) {
      select += ` WHERE id = $1`;
      values = [id];
    } else if (username) {
      select += ` WHERE member_username = $1`;
      values = [username];
    }
    const query = {
      text: select,
      values: values,
    };
    const { rows } = await pool.query(query);
    return rows.map(row => row.product);
  }

  public async updateProduct(
    id: string,
    updatedProduct: NewProduct,
    dateCreated: string,
  ): Promise<Product> {
    const update = `
        UPDATE product
        SET category_slug=$2,
            data=$3
        WHERE id = $1
        RETURNING *
    `;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, category, ...other } = updatedProduct;
    const data = Object.assign(other, { date: dateCreated });
    const query = {
      text: update,
      values: [id, category, JSON.stringify(data)],
    };
    const { rows } = await pool.query(query);

    const product = rows[0].data;
    product.user = rows[0].member_username;
    product.category = rows[0].category_slug;
    product.id = rows[0].id;

    return product;
  }

  public async add(newProduct: NewProduct): Promise<Product> {
    const insert = `
      INSERT INTO product(member_username, category_slug, data)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const { user, category, ...other } = newProduct;
    const data = Object.assign(other, { date: new Date().toISOString() });
    const query = {
      text: insert,
      values: [user, category, data],
    };
    const { rows } = await pool.query(query);

    const product = rows[0].data;
    product.user = rows[0].member_username;
    product.category = rows[0].category_slug;
    product.id = rows[0].id;

    return product;
  }

  public async remove(id: string): Promise<Product> {
    const query = {
      text: 'DELETE FROM product WHERE id = $1 RETURNING *',
      values: [id],
    };
    const { rows } = await pool.query(query);

    if (!rows[0]) throw new Error('Product not found');

    const product = rows[0].data;
    product.user = rows[0].member_username;
    product.category = rows[0].category_slug;
    product.id = rows[0].id;

    return product;
  }

  public async setAttributeValue(
    attribute: AttributeValueArg,
    product: string
  ): Promise<AttributeValueArg>{
    const insert = `
      INSERT INTO attribute_value(product_id, attribute_id, data)
      VALUES ($1, $2, $3) 
      RETURNING data || jsonb_build_object('id', id, 'attribute_id', attribute_id) AS attribute
    `;
    const query = {
      text: insert,
      values: [product, attribute.id, { value: attribute.value }],
    };
    const { rows } = await pool.query(query);

    return rows[0].attribute;
  }

  public async stat(): Promise<ProductStat>{
    const update = 'SELECT COUNT(*) FROM product';
    const query = {
      text: update,
    };
    const { rows } = await pool.query(query);

    return rows[0];
  }
}
