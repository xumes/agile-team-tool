{
  "_id": "_design/iterations",
  "_rev": "3-eca414881ba93ad9234933cb95441aa4",
  "views": {
    "completed": {
      "map": "function (doc) {\n  if (doc.type == \"iterationinfo\" && (doc.doc_status === null || doc.doc_status != 'delete')) {\n    if (doc.iterationinfo_status == \"Completed\") {\n          emit(doc.iteration_end_dt, doc);\n    }\n  }\n} "
    },
    "teamIteration": {
      "map": "function (doc) {\r\n  if (doc.type == \"iterationinfo\" && (doc.doc_status === null || doc.doc_status != 'delete')) {\r\n    emit(doc.team_id, doc);\r\n  }\r\n} "
    }
  },
  "language": "javascript",
  "indexes": {
    "searchAll": {
      "analyzer": "standard",
      "index": "function (doc) {\n  if (doc.type == \"iterationinfo\" && (doc.doc_status === null || doc.doc_status != 'delete')) {\n    index(\"default\", doc.team_id); \n    if (doc.iterationinfo_status) {\n      index(\"status\", doc.iterationinfo_status, {\"store\": true, \"facet\": true});\n    }\n    if (doc.iteration_end_dt) {\n      var date = doc.iteration_end_dt.split(\"/\");\n      index(\"end_date\", parseInt(date[2]+date[0]+date[1]), {\"store\": true, \"facet\": true});\n    }\n    if (doc.iteration_name) {\n      index(\"name\", doc.iteration_name, {\"store\": true, \"facet\": true});\n    }\n    if (doc.team_id) {\n      index(\"team_id\", doc.team_id, {\"store\": true, \"facet\": true});\n    }\n  }\n}"
    }
  }
}