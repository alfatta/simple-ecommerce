const responseBuilder = require('../helper/response')

module.exports.getAll = (req, res) => {
  // filter
  // - range harga maxPrice minprice
  // - kondisi barang condition
  // search (/product?q=mainan)
  // sorting
  // - dinamis (/product?sort=price&order=asc)
  // paginate (/product?page=4&perpage=10)
  // - meta : page, perpage, lastPage, firstPage, prevPage, nextPage

  let sql = 'SELECT * FROM `product` WHERE deleted_at IS NULL'

  let {
    maxPrice, minPrice, condition, q, sort, order, page, perPage
  } = req.query
  if (maxPrice && minPrice) {
    sql += ` AND price BETWEEN ${minPrice} AND ${maxPrice}`
  }

  if (condition) {
    sql += ` AND \`condition\` = ${condition}`
  }

  if (q) {
    sql += ` AND name LIKE '%${q}%'`
  }

  if (sort) {
    if (!order) order = 'asc'
    sql += ` ORDER BY ${sort} ${order}`
  } else {
    sql += ` ORDER BY created_at desc`
  }

  

  let sql2 = sql.replace('*', 'COUNT(*) as count')

  console.log(sql2);
  
  req.db.query(sql2, (err2, result2) => {
    const totalData = result2[0].count

    if (page) {
      if (!perPage) perPage = 20
      const offset = (page - 1) * perPage
      sql += ` LIMIT ${offset}, ${perPage}`
    }

    console.log(sql);
    req.db.query(sql, (err, result) => {
      if (err) {
        res.send(
          responseBuilder(0, err.message)
        )
        console.log(err.message);
      } else {
        console.log('RESULT : ', result);
        res.send(
          responseBuilder(1, null, result, {
            count: result.length,
            total: totalData,
            page: parseInt(page),
            perPage: parseInt(perPage),
            totalPage: Math.ceil(totalData / perPage),
            firstPage: 1,
            lastPage: Math.ceil(totalData / perPage),
            prevPage: parseInt(page) - 1 < 1 ? null : parseInt(page) - 1,
            nextPage: (parseInt(page) + 1) > Math.ceil(totalData / perPage) ? null : (parseInt(page) + 1)
          })
        )
      }
    })
  })
  
}

module.exports.getById = (req, res) => {
  const sql = `
    SELECT p.*,
      CONCAT(
        '[',
        GROUP_CONCAT(
          DISTINCT CONCAT(
            '{',
              '"id":',s.id, ',',
              '"key":"', s.key, '",',
              '"value":"', s.value, '"',
            '}'
          )
        ),
        ']'
      ) as specification
    FROM product as p
    LEFT JOIN specification as s
    ON s.id_product = p.id 
    WHERE p.id = ? AND p.deleted_at IS NULL AND s.deleted_at IS NULL
    GROUP BY p.id
  `
  req.db.query(sql, req.params.id, (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      if (result.length) {
        const data = result[0]
        if (data.specification) {
          data.specification = JSON.parse(data.specification)
        } else {
          data.specification = []
        }
        res.send(
          responseBuilder(1, null, data)
        )
      } else {
        res.status(404)
        res.send(
          responseBuilder(0, 'Not Found')
        )
      }
    }
  })
}

module.exports.insert = (req, res) => {
  if (req.body.id) delete req.body.id
  if (Object.keys(req.body).length == 0){
    return res.send(
      responseBuilder(0, 'Missing property')
    )
  }

  const dataProduct = { ...req.body }
  delete dataProduct.specification

  const sql = 'INSERT INTO `product` SET ?'
  req.db.query(sql, dataProduct, (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      console.log('RESULT : ', result);

      if (req.body.specification && req.body.specification.length) {
        const dataSpecification = req.body.specification.map(s => {
          return [s.key, s.value, result.insertId]
        })
  
        console.log(dataSpecification);
        
        const sql2 = 'INSERT INTO specification (`key`, `value`, `id_product`) VALUES ?'
        req.db.query(sql2, [dataSpecification])
      }

      const sql3 = 'SELECT * FROM `product` WHERE `id` = ?'
      req.db.query(sql3, result.insertId, (err3, result3) => {
        if (err3) {
          res.send(
            responseBuilder(0, err3.message)
          )
          console.log(err3.message);
        } else {
          res.send(
            responseBuilder(1, null, result3[0])
          )
        }
      })
    }
  })
}

module.exports.update = (req, res) => {
  if (req.body.id) delete req.body.id
  if (Object.keys(req.body).length == 0){
    return res.send(
      responseBuilder(0, 'Missing property')
    )
  }
  const sql = 'UPDATE `product` SET ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL'
  req.db.query(sql, [req.body, req.params.id], (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      if (result.affectedRows) {
        console.log('RESULT : ', result);
        const sql2 = 'SELECT * FROM `product` WHERE `id` = ?'
        req.db.query(sql2, req.params.id, (err2, result2) => {
          if (err2) {
            res.send(
              responseBuilder(0, err2.message)
            )
            console.log(err2.message);
          } else {
            res.send(
              responseBuilder(1, null, result2[0])
            )
          }
        })
      } else {
        res.status(404)
        res.send(
          responseBuilder(0, 'Not Found')
        )
      }
    }
  })
}

module.exports.delete = (req, res) => {
  const sql = 'UPDATE `product` SET updated_at = NOW(), deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL'
  req.db.query(sql, req.params.id, (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      if (result.affectedRows) {
        console.log('RESULT : ', result);
        const sql2 = 'SELECT * FROM `product` WHERE `id` = ?'
        req.db.query(sql2, req.params.id, (err2, result2) => {
          if (err2) {
            res.send(
              responseBuilder(0, err2.message)
            )
            console.log(err2.message);
          } else {
            res.send(
              responseBuilder(1, null, result2[0])
            )
          }
        })
      } else {
        res.status(404)
        res.send(
          responseBuilder(0, 'Not Found')
        )
      }
    }
  })
}