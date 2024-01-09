import express from 'express'
import {v4 as uuidv4} from 'uuid'
import {readFile, writeFile} from 'node:fs/promises'


const server = express();
const port  = process.env.PORT || 8000;

server.use(express.json())

server.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
})

server.get('/menu', async (req, res)=>{
    try{
        const data = await readData();
        res.status(200).json(data)
    } catch(error){
        res.status(500).json({error: "Something went wrong!"})
    }
})
server.post('/menu', async (req, res)=>{
    const {title, category, price, src, desc} = req.body;
    try{
        let data = await readData();
        if(data.some(meal => meal.title.toLowerCase()===title.toLowerCase())){
            res.status(403).json({message: `title ${title} is already taken!`})
        }else{
            data.push({
                id : uuidv4(10),
                title : title,
                category: category,
                price: price,
                src: src,
                desc: desc
            })
            writeData(data)
            res.status(201).json({message:"Meal was created successfully!"})
        }
    } catch(error){
        res.status(500).json({message: "Something went wrong!"})
    }
})
server.delete('/menu/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const data = await readData();
        const meal = data.find(meal => meal.id===id)
        if(meal !== undefined){
            const title = meal.title;
            writeData(data.filter(meal => meal.id !== id))
            res.status(200).json({message: `meal ${title} deleted successfully!`})
        } else{
            res.status(401).json({message: `Meal not found, please try again!`})
        }
    } catch(error){
        res.status(500).json({error: "Something went wrong!"})
    }
})
server.patch('/menu/:id', async (req, res)=>{
    const id = req.params.id;
    try{
        const data = await readData();
        const mealToUpdate = data.find(meal => meal.id===id)
        const mealIndex = data.indexOf(mealToUpdate);

        if(mealIndex !== -1){
            Object.assign(mealToUpdate, req.body)
            data[mealIndex] = mealToUpdate;
            writeData(data);
            res.status(200).json({message: `meal ${mealToUpdate.title} updated successfully!`})
        } else{
            res.status(401).json({message: `Meal not found, please try again!`})
        }
    } catch(error){
        res.status(500).json({error: "Something went wrong!"})
    }
})

server.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})

async function readData(){
    const data = await readFile('./data/menu.json', {encoding:"utf8"})
    return JSON.parse(data)
}

function writeData(data){
    writeFile('./data/menu.json', JSON.stringify(data, undefined, 4), () =>{})
}