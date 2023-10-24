import { createSlice, createAsyncThunk, createEntityAdapter, createSelector }  from "@reduxjs/toolkit";
import {useHttp} from '../../hooks/http.hook';

const heroesAdapter = createEntityAdapter();

const initialState = heroesAdapter.getInitialState({
    heroesLoadingStatus: 'idle'
});

//генирируем начальное состояние на основании адаптера

export const fetchHeroes = createAsyncThunk(
    'heroes/fetchHeroes', //имя среза/тип действия 
     () => {
        const {request} = useHttp();
        return request("https://ybv8lr9edd.execute-api.eu-central-1.amazonaws.com/prod/heroes");
        
     }
    //ф-я которая return асс-ый код (промис)
);
// команда createAsyncThunk() возвразант нам три action creators(pending, fulField, rejected), котор. можно использовать для работы с асинх. операциями.Далее есть две задачи:
//1) Обработать  конечные action creaters (pending, fulField, reject),которые return состояние промиса.Их оброб-ся  в createSlice, они записываются в формате extraReducers
//2) Запустить action creaters fetchHeroes в нужном месте.

const heroesSlice = createSlice ({
    name: 'heroes',
    initialState,
    reducers: {
        heroCreated: (state, action) => {
                    heroesAdapter.addOne(state, action.payload);
                    // state.heroes.push(action.payload);
        },
        deleteHero: (state, action) => {
                    heroesAdapter.removeOne(state, action.payload);
                    // state.heroes = state.heroes.filter(item => item.id !== action.payload)                        
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHeroes.pending, state => {state.heroesLoadingStatus = 'loading'})
            .addCase(fetchHeroes.fulfilled,  (state, action) => {
                state.heroesLoadingStatus = 'idle';
                heroesAdapter.setAll(state, action.payload)
            })
            .addCase(fetchHeroes.rejected, state => {
                state.heroesLoadingStatus ='error';
            })
            .addDefaultCase(() => {})
    }
    //Здесь пишем какие события будут просходить внутри редюсеров, т.е будет какое-то свойство внутри которого будет лежать ф-я принимающая аргументами стейт и экшен и по итого ,что-то будет делать со стором эта ф-я.
    //Когда heroesSlice отработает она вернет три разныех сущности: имя, обьект с экшенами, редюсер
})

const {actions, reducer} = heroesSlice;

export default reducer;

const {selectAll} = heroesAdapter.getSelectors(state => state.heroes)
//Такая запись говорит, что я создаю обьект и вытаскиваю selectAll из этого обькта и экспортирую. Вот так появился функционал по вытаскиванию всех элементов и можно его юзать в любой части приложения.

//создаем новый селектор
//ф-я createSelector form 'reselect' момоизирует значение, если значение поля , которое проверяем не изменилось, то не будет вызываться рендеринг.Эту ф-ю удобно юзать, когда разные значения лежат в разных кусочках нашего стейта
export const filteredHeroesSelector = createSelector(
    (state) => state.filters.activeFilter,
    selectAll,
    // (state) => state.heroes.heroes,
    (filter, heroes) => {
        if(filter === 'all') {
            return heroes;
        } else {
            return heroes.filter(item => item.element === filter)
        }
    }
);


export const {
    heroesFetching,
    heroesFetched,
    heroesFetchingError,
    heroCreated,
    deleteHero    
} = actions;