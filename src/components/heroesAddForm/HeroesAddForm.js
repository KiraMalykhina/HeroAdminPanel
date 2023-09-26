import {useHttp} from '../../hooks/http.hook';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import store  from '../../store';

import { heroCreated } from '../heroesList/heroesSlice';
import { selectAll} from '../heroesFilters/filtersSlice';

// Задача для этого компонента:
// Реализовать создание нового героя с введенными данными. Он должен попадать
// в общее состояние и отображаться в списке + фильтроваться
// Уникальный идентификатор персонажа можно сгенерировать через uiid;
// Усложненная задача:
// Персонаж создается и в файле qjson при помощи метода POST
// Дополнительно:
// Элементы <option></option> желательно сформировать на базе
// данных из фильтров
const HeroesAddForm = () => {
    //Состояния для контроля формы
    const [heroName, setHeroName] = useState('');
    const [herodescription, setHerodescription] = useState('');
    const [heroElement, setHeroElement] = useState('');
   
    const {filtersLoadingStatus } = useSelector(state => state.filters);
    const filters = selectAll(store.getState());
    const dispatch = useDispatch();
    const {request} = useHttp();

    const onSubmitHandler = (e) => {
        e.preventDefault();
        // Генерация id через библиотеку
        const newHero = {
            id: uuidv4(),
            name: heroName,
            description: herodescription,
            element: heroElement
        }
        // Отправляем данные на сервер в формате JSON
        // ТОЛЬКО если запрос успешен - отправляем персонажа в store
        request("http://localhost:3001/heroes", "POST", JSON.stringify(newHero))
            .then(res => console.log(res, "Запрос успешен"))
            .then (res => dispatch(heroCreated(newHero)))
            .catch(err => console.log(err));
            
        // Очищаем форму после отправки
        setHeroName('');
        setHerodescription('');
        setHeroElement('');
    }

    const renderFilters = (arr, status) => {

        if (status === "loading") {
            return <option>Загрузка элементов</option>
        } else if (status === "error") {
            return <option>Загрузка элементов</option>
        }
        if (arr && arr.length > 0) {
            return arr.map(({name, label}) => {
                if(name ==='all') return;

                return <option key={name} value={name}>{label}</option>
            })
        }
    }

    return (
        <form className="border p-4 shadow-lg rounded" onSubmit={onSubmitHandler}>
            <div className="mb-3">
                <label htmlFor="name" className="form-label fs-4">Имя нового героя</label>
                <input 
                    required
                    type="text" 
                    name="name" 
                    className="form-control"
                    onChange={(e) => setHeroName(e.target.value)} 
                    id="name" 
                    placeholder="Как меня зовут?"
                    value={heroName}/>
            </div>
            <div className="mb-3">
                <label htmlFor="text" className="form-label fs-4">Описание</label>
                <textarea
                    required
                    name="text" 
                    className="form-control" 
                    id="text"
                    value={herodescription}
                    onChange={(e) => setHerodescription(e.target.value)}  
                    placeholder="Что я умею?"
                    style={{"height": '130px'}}/>
            </div>
            <div className="mb-3">
                <label htmlFor="element" className="form-label">Выбрать элемент героя</label>
                <select 
                    required
                    className="form-select" 
                    id="element"
                    value={heroElement}
                    onChange={(e) => setHeroElement(e.target.value)}   
                    name="element">
                    <option >Я владею элементом...</option>
                    {renderFilters(filters, filtersLoadingStatus )}
                </select>
            </div>
            
            <button type="submit" className="btn btn-primary">Создать</button>
        </form>
    )
}
export default HeroesAddForm;