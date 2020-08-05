const responseBuilder = require('../helper/response')

module.exports.update = (req, res) => {
  if (req.body.id) delete req.body.id
  if (Object.keys(req.body).length == 0){
    return res.send(
      responseBuilder(0, 'Missing property')
    )
  }
  const sql = 'UPDATE `specification` SET ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL'
  req.db.query(sql, [req.body, req.params.id], (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      if (result.affectedRows) {
        console.log('RESULT : ', result);
        const sql2 = 'SELECT * FROM `specification` WHERE `id` = ?'
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
  const sql = 'UPDATE `specification` SET updated_at = NOW(), deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL'
  req.db.query(sql, req.params.id, (err, result) => {
    if (err) {
      res.send(
        responseBuilder(0, err.message)
      )
      console.log(err.message);
    } else {
      if (result.affectedRows) {
        console.log('RESULT : ', result);
        const sql2 = 'SELECT * FROM `specification` WHERE `id` = ?'
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