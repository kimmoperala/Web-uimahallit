var mysql = require('mysql');
var express = require('express');
var app = express();
var mongo = require('mongodb');
require('dotenv').config();

const MongoClient = mongo.MongoClient;

async function listDatabases(client) {
  databasesList = await client.db().admin().listDatabases();

  console.log('Databases:');
  databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

async function findLastId(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').find().sort({_id:-1}).limit(1);
  const result = await cursor.toArray();
  const result2 = JSON.stringify(result);
  console.log(result2.nimi);
}

//COUNT
async function count(client) {
  const result = await client.db('swim_halls').
      collection('halls_capital_area').
      countDocuments();
  console.log(result);
}

//CREATE
async function createListing(client, newListing) {
  const result = await client.db('swim_halls').
      collection('halls_capital_area').
      insertOne(newListing);
  console.log(
      `New swimhall created with the following id: ${result.insertedId}`);
}

//READALL
async function findAllListings(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find();
  const result = await cursor.toArray();
  console.log(result);
}

//READCITY EXAMPLE
async function findByCity(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({nimi: 'Mäkelänrinteen uimahalli'});
  const result = await cursor.toArray();
  console.log(result);
}

//READSEARCHWORD EXAMPLE
async function findByWord(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({nimi: /AAGA/i});
  const result = await cursor.toArray();
  console.log(result);
}

//READOPTIONS (AND)
async function findByAnd(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({kaupunki: 'Helsinki', hinta: 5});
  const result = await cursor.toArray();
  console.log(result);
}

//READOPTIONS (OR)
async function findByOr(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({$or: [{kaupunki: 'Kerava'}, {alehinta: {$lte: 2.9}}]});
  const result = await cursor.toArray();
  console.log(result);
}

//READOPTIONS (OR) VERSION 2
async function findByList(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({hinta: {$in: [6.7, 5.5]}});
  const result = await cursor.toArray();
  console.log(result);
}

//READLIMITS (for example, find with alehinta <= 2.9)
async function findByLimits(client) {
  const cursor = await client.db('swim_halls').
      collection('halls_capital_area').
      find({alehinta: {$lte: 2.9}});
  const result = await cursor.toArray();
  console.log(result);
}

//READVALUE (shows only single values, does not show duplicates!!)
async function findValue(client) {
  const value = await client.db('swim_halls').
      collection('halls_capital_area').
      distinct('nimi', {alehinta: 3.3});
  console.log(value);
}

//READ
async function findOneListingByName(client, nameOfListing) {
  const result = await client.db('swim_halls').
      collection('halls_capital_area').
      findOne({nimi: nameOfListing});
  if (result) {
    console.log(
        `Found a listing in the collection with the name '${nameOfListing}':`);
    console.log(result);
  } else {
    console.log(`No listings found with the name '${nameOfListing}'`);
  }
}

//UPDATE
async function updateListingByName(client, idOfListing, updatedListing) {
  result = await client.db('swim_halls').
      collection('halls_capital_area').
      updateOne({_id: idOfListing}, {$set: {hinta: updatedListing}});

  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//UPDATEMANY(does not change old value if the key already existed)
async function updateManyListings(client) {
  result = await client.db('swim_halls').
      collection('halls_capital_area').
      updateMany({url: {$exists: false}},
          {$set: {url: "www.esim.fi"}});
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//UPDATEFIELD
async function updateField(client, idOfListing, updateInfo) {
  result = await client.db('swim_halls').
      collection('halls_capital_area').
      updateOne({_id: idOfListing}, {$push: {kommentit: updateInfo}});
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//DELETEFIELD
async function deleteField(client, idOfListing) {
  await client.db('swim_halls').
      collection('halls_capital_area').
      updateOne({_id: idOfListing}, {$unset: {'kommentit.0': 1}});
  result = await client.db('swim_halls').
      collection('halls_capital_area').
      updateOne({_id: idOfListing}, {$pull: {'kommentit': null}});
  console.log(`${result.matchedCount} document(s) matched the query criteria.`);
  console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

//DELETE
async function deleteListingByName(client, numberOfListing) {
  result = await client.db('swim_halls').
      collection('halls_capital_area').
      deleteOne({_id: numberOfListing});
  console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

async function getHigh(client) {
  result = await client.db('swim_halls').
      collection('halls_capital_area').aggregate({
        $group: {
          _id: '',
          last: {
            $max: "$_id"}
        }
      });
  console.log(result);
}

async function main() {
  const uri = 'mongodb+srv://' + process.env.DB_USER + ':' +
      process.env.DB_PASSWORD +
      '@siseujula-vfiyp.mongodb.net/test?retryWrites=true&w=majority';
  const client = new MongoClient(uri,
      {useNewUrlParser: true, useUnifiedTopology: true});
  try {
    await client.connect();
    //await findByList(client);
    //await findByLimits(client);
    //await findByWord(client);
    await findLastId(client);
    //await getHigh();
    //await count(client);
    //await listDatabases(client);
    //await findAllListings(client);
    //await findValue(client);
    //await findByOr(client);
    //await findOneListingByName(client, "Haagan uimahalli");
    //await deleteListingByName(client, 2);
    //await updateManyListings(client);
    //await deleteField(client, 4);
    //await updateField(client, 13, "pertti on uimamaisteri")
    //await updateListingByName(client, 13,9.8);
    /*await updateListingByName(client, "Mäkelänrinteen uimahalli", {
          ratamäärä:8
    });
    await createListing(client,
        {
          _id: 5,
          nimi: 'Swahilin uimahalli',
          ratapituus: 25,
          ratamäärä: 6,
          puhelin: "0403182081",
          aika: [
            '6.00-21.00',
            '9.00-21.00',
            '6.00-21.00',
            '6.00-21.00',
            '6.00-21.00',
            '9.00–20.00',
            '9.00–20.00'],
          hinta: 6.0,
          alehinta: 3.0,
          osoite: 'Aavikkotie 45, 04200 Swahili',
          kaupunki: "Siwa",
          kommentit: []
        },
    );*/
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.err);