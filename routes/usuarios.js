let express = require('express');
let router = express.Router();
let path = require('path')
let models = require('./../models/DBModels')
let bcrypt = require('bcrypt')
let sanitizer = require('sanitizer')
let mongoose = require('mongoose')
let lodash = require('lodash')

router.post('/login', (req, res, next) => {
  /**
   * @type {{username : String, password : String}}
   */
  let params = req.body
  if(!(params.username && params.password))
  {
    res.status(400).end("Invalid parameters.")
  }
  else
  {
    params.username = sanitizer.sanitize(params.username)

    models.Usuario.findOne({username : params.username})
      .then((user) => {
        if(!user)
        {
          res.status(400).end("Invalid username or password")
        }
        else
        {
          bcrypt.compare(params.password, user.password, (err, equals) => {
            if(err)
            {
              res.status(500).end("Error while authenticating user")
            }
            else if(equals)
            {
              req.session.regenerate(err => {
                if(err)
                {
                  res.status(500).end("Error while authenticating user")
                }
                else
                {
                  req.session.usuario = user;
                  req.session.usuario.password = undefined
                  req.session.save(err => {
                    if(err)
                    {
                      res.status(500).end("Error while authenticating user")
                    }
                    else
                    {
                      res.status(200).json(req.session.usuario)
                    }
                  })
                  
                }
              })
            }
            else
            {
              res.status(400).end("Invalid username or password")
            }
          })
        }
      })
  }
})


router.delete('/login', (req, res, next) => {

  req.session.regenerate(err => {
    if(err)
    {
      res.status(500).end("Error while logging out")
    }
    else
    {
      res.status(200).json({})
    }
  })
})

function IsLoggedIn(req)
{
  return typeof (req.session.usuario) != 'undefined' && req.session.usuario != null;
}

function IsAdmin(req){
  return req.session.usuario.admin
}

function CanDeleteUser(id){
  return new Promise((resolve, reject) => {
    if(mongoose.Types.ObjectId.isValid(id))
    {
      models.Usuario.find({admin : true}, (err, usuarios) =>{

        if(usuarios.length > 1)
        {
          resolve(true)
        }
        else
        {
          lodash.remove(usuarios, (usuario) =>{
            return usuario._id == id;
          })

          resolve(usuarios.length > 0);
        }
      })
    }
    else
    {
      reject(new Error("Id inválido"))
    }
  })
}

router.use((req, res, next) => {
  if(IsLoggedIn(req))
  {
    next();
  }
  else
  {
    res.status("401").end("Must be logged in");
    //next();
  }
})

router.get('/usuario', (req, res, next) => {
  /**
   * @type {{id : string}}
   */
  let params = req.query

  if(params.id == null)
  {
    params.id = req.session.usuario._id
  }
  if(mongoose.Types.ObjectId.isValid(params.id))
  {
    models.Usuario.findById(params.id, (err, usuario) => {
      if(err)
      {
        res.status(500).end(err.message)
      }
      else if(!usuario)
      {
        res.status(404).end("Usuário não encontrado")
      }
      else{
        usuario.password = undefined
        res.status(200).json(usuario);
      }
    })
  }
  else
  {
    res.status(400).end("Invalid id");
  }
})
router.post('/usuario', (req, res, next) => {
  /**
   * @type {{username : string, password : password}}
   */
  let params = req.body

  if(!IsAdmin(req))
  {
    res.status(401).end("Must be admin")
    return
  }
  

  params.username = sanitizer.sanitize(params.username)
  models.Usuario.findOne({username : params.username}, (err, usuarioEncontrado) => {
    if(err)
    {
      res.status(500).end(err.message)
    }
    else if(usuarioEncontrado)
    {
      res.status(400).end("Usuário já existe")
    }
    else
    {
      bcrypt.hash(params.password, 12, (err, encryptedPassword) =>{
        if(err)
        {
          res.status(500).end(err.message)
        }
        else{
          models.Usuario.create({username : params.username, password : encryptedPassword, admin : params.admin})
            .then(usuarioCriado => {
                usuarioCriado['password'] = undefined
                res.status(200).json(usuarioCriado);
            }).catch(err => {
              res.status(200).end(err.message);
            })
        }
      })
    }
  })
})

/*router.delete("/usuario", (req, res, next) => {

  let params = req.query

  if(mongoose.Types.ObjectId.isValid(params.id))
  {
    models.Usuario.find({}, (err, usuarios) => {
      if(err)
      {
        res.status(500).end(err.message)
      }
      else if(usuarios.length == 1)
      {
        res.status(400).end("Sempre deve conter pelo menos 1 usuário.")
      }
      else{
          let usuarioDeletado = lodash.find(usuarios, (usuario) => {
            return usuario._id == params.id
          })
          if(usuarioDeletado == null)
          {
            res.status(404).status("Usuário não encontrado");
          }
          else
          {
            usuarioDeletado.remove()
              .then(() => {
                  usuarioDeletado.password = undefined
                  res.status(200).json(usuarioDeletado)
              })
              .catch((err) => {
                  res.status(500).end(err.message);
              })
          }
      }
    })
  }
  else
  {
    res.status(400).end("Invalid id");
  }
})*/

router.delete("/usuario", (req, res, next) => {
  if(!IsAdmin(req))
  {
    res.status(401).end("Precisa ser administrador");
    return
  }

  let params = req.query

  let deleteBySession = () =>{
    let id = req.session.usuario._id;
    models.Usuario.deleteOne({_id : id}, (err) => {
      if(err)
      {
        res.status(500).end(err.message);
      }
      else{
        req.session.regenerate(err => {
          if(err)
          {
            res.status(500).end("Error while logging out")
          }
          else
          {
            res.status(200).json({})
          }
        })
      }
    })
  }

  let deleteById = ()=> {
    if(mongoose.Types.ObjectId.isValid(params.id))
    {
      models.Usuario.find({}, (err, usuarios) => {
        if(err)
        {
          res.status(500).end(err.message)
        }
        else if(usuarios.length == 1)
        {
          res.status(400).end("Sempre deve conter pelo menos 1 usuário.")
        }
        else{
            let usuarioDeletado = lodash.find(usuarios, (usuario) => {
              return usuario._id == params.id
            })
            if(usuarioDeletado == null)
            {
              res.status(404).status("Usuário não encontrado");
            }
            else
            {
              usuarioDeletado.remove()
                .then(() => {
                    usuarioDeletado.password = undefined
                    res.status(200).json(usuarioDeletado)
                })
                .catch((err) => {
                    res.status(500).end(err.message);
                })
            }
        }
      })
    }
    else
    {
      res.status(400).end("Invalid id");
    }
  }
  
  if(params.id == null)
  {
    let id = req.session.usuario._id;
    CanDeleteUser(id)
      .then(can => {
        if(can)
        {
          deleteBySession()
        }
        else
        {
          res.status(401).end("Deve existir pelo menos 1 administrador")
        }
      })
      .catch(err => {
        res.status(500).end(err.message);
      })
  }
  else
  {
    let id = req.session.usuario._id;
    CanDeleteUser(id)
      .then(can => {
        if(can)
        {
          deleteById()
        }
        else
        {
          res.status(401).end("Deve existir pelo menos 1 administrador")
        }
      })
      .catch(err => {
        res.status(500).end(err.message);
      })
  }
})

router.put("/usuario", (req, res, next) =>{
  if(!IsAdmin(req))
  {
    res.status(401).end("Precisa ser administrador");
    return
  }

  /**
   * @type {{username : string, password : password, admin : Boolean}}
   */
  let params = req.body

  let query = req.query

  let id = query.id != null ? query.id : req.session.usuario._id

  if(!mongoose.Types.ObjectId.isValid(id))
  {
    res.status(400).end("Id inválido")
    return
  }

  models.Usuario.findById(id, (err, usuario) => {
    if(err)
    {
      res.status(500).end(err.message)
    }
    else
    {
      let changeUsername = () => {
        return new Promise((resolve, reject) => {
          try
          {
            usuario.username = sanitizer.sanitize(params.username);
            resolve();
          }
          catch(err)
          {
            reject(err);
          }
        })
      }

      let changePassword = () => {
        return new Promise((resolve, reject) => {
          bcrypt.hash(params.password, 12, (err, encryptedPassword) => {
            if(err)
            {
              reject(err);
            }
            else
            {
              usuario.password = encryptedPassword;
              resolve();
            }
          })
        })
      }

      let changeAdmin = (value) =>{
        return new Promise((resolve, reject) => {
          if(value == false)
          {
            CanDeleteUser(usuario._id)
              .then(can => {
                if(can)
                {
                  usuario.admin = value;
                  resolve();
                }
                else
                {
                  reject(new Error("Precisa exister pelo menos 1 administrador"))
                }
              })
              .catch(err =>{
                reject(err)
              })
          }
          else
          {
            usuario.admin = value;
            resolve();
          }
        })
      }

      let promisses = []
      if(params.username != null && params.username.toLowerCase() != req.session.usuario.username)
      {
        promisses.push(changeUsername())
      }
      if(params.password != null)
      {
        promisses.push(changePassword())
      }
      if(params.admin != null)
      {
        promisses.push(changeAdmin(params.admin))
      }
      Promise.all(promisses)
        .then(() => {
          usuario.save()
            .then((novoUsuario) => {
              if(req.session.usuario._id == id)
              {
                novoUsuario.password = undefined
                req.session.usuario = novoUsuario
               
              }
              
              res.status(200).json(novoUsuario)
            })
            .catch(err => {
              res.status(500).end(err.message)
            })
        }).catch(err => {
          res.status(500).end(err.message)
        })
    }
  })


})


module.exports = router;
