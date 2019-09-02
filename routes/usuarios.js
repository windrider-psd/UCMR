let express = require('express');
let router = express.Router();
let path = require('path')
let models = require('./../models/DBModels')
let bcrypt = require('bcrypt')
let sanitizer = require('sanitizer')

function render(view, res)
{
  res.sendFile(path.resolve('public/'+view+'.html')); 
}

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
                  delete req.session.usuario.password
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


router.get('/', function(req, res)
{
  render('pagina-inicial', res);
});

router.get('/simulador', (req, res) =>
{
  render('simulador', res);
});

router.get('/topicos', (req, res) =>
{
  render('topicos', res);
});

router.get('/configuracoes', function(req, res) {
    render('configuracoes', res)
});


router.get('/energia', (req, res) =>
{
    render("energia", res);
});
router.get('/log', (req, res) =>
{
  render("log", res);
});


module.exports = router;
