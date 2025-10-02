import yaml from 'yaml';
import fs from 'fs';

const archivo = fs.readFileSync('./Parcial_2/Yaml/EjercicioYaml.yml', 'utf-8');
const info = yaml.stringify(archivo);
console.log(info)