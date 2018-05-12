import React from 'react';
import DataCleaner from './DataCleaner';
import { mockDirtyPeopleData, mockCleanedPeopleData, mockDirtyHomeworldData, mockDirtySpeciesData } from './mockData';
import { shallow } from 'enzyme';

describe('Data cleaner', () => {
  let dataCleaner;

  beforeEach(() => {
    window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve(
        mockDirtyPeopleData
      )
    }))
   
   dataCleaner = new DataCleaner();
  })

  it('shoul match snapshot', () => {
    expect(DataCleaner).toMatchSnapshot();
  });

  describe('fetchData', () => {
    it('should fetch data with the corrent url', async () => {
      const filter = 'people';
      const expected = 'https://swapi.co/api/people';

      await dataCleaner.fetchData(filter)

      expect(window.fetch).toHaveBeenCalledWith(expected);
    })

    it('should call cleanPeopleData with the correct arguments based on filter', async () => {
      const filter = 'people';
      const mockData = mockDirtyPeopleData.results;

      dataCleaner.cleanPeopleData = jest.fn();

      await dataCleaner.fetchData(filter)

      expect(dataCleaner.cleanPeopleData).toHaveBeenCalledWith(mockData);
    })
  });

  describe('cleanPeopleData', () => {
    
    beforeEach(() => {
      dataCleaner.cleanHomeworldData = jest.fn().mockImplementation(() => { 
        return {name: 'Tatooine' , population: '200000' }
      });
      dataCleaner.cleanSpeciesData = jest.fn().mockImplementation(() => {
        return 'Human'
      })
    })

    it('should call cleanHomeworldData and cleanSpeciesData with the correct args', async () => {
      const mockData = mockDirtyPeopleData.results
      const expectedHomeworldArg = mockDirtyPeopleData.results[0].homeworld
      const expectedSpeciesArg = mockDirtyPeopleData.results[0].species

      await dataCleaner.cleanPeopleData(mockData)

      expect(dataCleaner.cleanHomeworldData).toHaveBeenCalledWith(expectedHomeworldArg)
      expect(dataCleaner.cleanSpeciesData).toHaveBeenCalledWith(expectedSpeciesArg)
    })
    
    it('should return an array of objects containing clean data', async () => {
      const mockData = mockDirtyPeopleData.results;
      const mockCleanPeopleData = [mockCleanedPeopleData];
      const result = await dataCleaner.cleanPeopleData(mockData)

      expect(result).toEqual(mockCleanPeopleData)
    })

  });

  describe('cleanHomeworldData', async () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
        status: 200,
        json: () => Promise.resolve(
          mockDirtyHomeworldData
        )
      }))
    })

    it('should call fetch with the correct argument', async () => {
      const homeworld = mockDirtyPeopleData.results[0].homeworld
      const expected = 'https://swapi.co/api/planets/1/'

      await dataCleaner.cleanHomeworldData(homeworld)

      expect(window.fetch).toHaveBeenCalledWith(expected);
    })

    it('should return an object with the homeworld name and population', async () => {
      const expected = { name: "Tatooine", population: "200000" }
      const homeworld = mockDirtyPeopleData.results[0].homeworld

      const result = await dataCleaner.cleanHomeworldData(homeworld);

      expect(result).toEqual(expected)
    })

  });

  describe('cleanSpeciesData', async () => {
    let species;

    beforeEach(() => {
      const species = mockDirtyPeopleData.results[0].species
      
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
        status: 200,
        json: () => Promise.resolve(
          mockDirtySpeciesData
        )
      }));
    })
    
    it('should call fetch with the correct argument', async () => {
      const species = mockDirtyPeopleData.results[0].species[0]
      const expected = 'https://swapi.co/api/species/1/'

      await dataCleaner.cleanSpeciesData(species)

      expect(window.fetch).toHaveBeenCalledWith(expected);
    })

    it('should return an object with the homeworld name and population', async () => {
      const expected = 'Droid'

      const result = await dataCleaner.cleanSpeciesData(species)

      expect(result).toEqual(expected)
    })

  });

});