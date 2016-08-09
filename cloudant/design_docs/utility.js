{
  "_id": "_design/utility",
  "_rev": "3-fcc03fd63b69ce55ae0b03b4416a0003",
  "views": {
    "teamMemberRoles": {
      "map": "function (doc) {\n  if (doc._id == 'ag_ref_team_type_role') \n    for (var n in doc.team_type_role_tbl)\n      emit(doc.team_type_role_tbl[n].name, doc.team_type_role_tbl[n]);\n}"
    }
  },
  "language": "javascript"
}