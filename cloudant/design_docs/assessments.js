{
  "_id": "_design/assessments",
  "_rev": "3-174bd21a231649aba14592d6735e3d64",
  "views": {
    "template": {
      "map": "function (doc) {\r\n  if (doc.type == 'ref_matassessment')\r\n      emit(doc.atma_status, doc);\r\n}"
    },
    "teamMaturity": {
      "map": "function (doc) {\n  if (doc.type == 'matassessmtrslt')\n    emit(doc.team_id, doc);\n}"
    }
  },
  "language": "javascript"
}