const express = require('express');
const path = require('path');
const { title } = require('process');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/hola', (req, res)=>{
    let Opciones ={
        title: 'Pug',
        message:'Hola mundoo'
    }
    res.render('index.pug', Opciones);
});

app.listen(3000, ()=>{
    console.log("Sevidor ");
});



//p Hola mundo
