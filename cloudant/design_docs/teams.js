{
  "_id": "_design/teams",
  "_rev": "25-c039212d63be480d7a0fb6dd2eec20c4",
  "views": {
    "teams": {
      "map": "function (doc) {\n  if ((doc.type == 'team') && (doc.doc_status === null || doc.doc_status != 'delete')) {\n    var teamMembers = [];\n    var teamCount = 0;\n    var teamAlloc = 0;\n    for (var i in doc.members) {\n  \t\tif (teamMembers.indexOf(doc.members[i].id) == -1) {\n  \t\t\tteamCount++;\n  \t\t\tteamMembers.push(doc.members[i].id);\n  \t\t}\n  \t\tteamAlloc += parseInt(doc.members[i].allocation);\n  \t}\n  \tteamAlloc = teamAlloc/100;\n  \temit(doc._id, \n      {\n        '_id': doc._id, \n        'name': doc.name, \n        'squadteam': doc.squadteam,\n        'parent_team_id': doc.parent_team_id,\n        'child_team_id': doc.child_team_id,\n        'total_members': teamCount,\n        'total_allocation': teamAlloc\n      });\n  }\n}"
    },
    "teamsWithMember": {
      "map": "function (doc) {\n  if (doc.type == \"team\" && (doc.doc_status === null || doc.doc_status != 'delete')) {\n    if (doc.members !== undefined && doc.members.length > 0) {\n      for(i=0; i<doc.members.length; i++)\n          emit(doc.members[i].id, \n          { \n            '_id': doc._id,\n            '_rev': doc._rev,\n            'name': doc.name,\n            'parent_team_id': doc.parent_team_id,\n            'child_team_id': doc.child_team_id,\n            'squadteam': doc.squadteam\n          }); \n    }\n  }\n}"
    },
    "teamNames": {
      "map": "function (doc) {\n  if ((doc.type == 'team') && (doc.doc_status === null || doc.doc_status != 'delete'))\n      emit(doc.name, {_id: doc._id, name: doc.name}); \n}"
    }
  },
  "indexes": {
    "name": {
      "analyzer": "standard",
      "index": "function (doc) {\n  if (doc.type == \"team\" && (doc.doc_status === null || doc.doc_status != 'delete')) {\n    index(\"default\", doc.name); \n    if (doc.name) {\n      index(\"name\", doc.name, {\"store\": true, \"facet\": true});\n    }\n    if (doc.squadteam) {\n      index(\"squad\", doc.squadteam, {\"store\": true, \"facet\": true});\n    }\n  }\n}"
    }
  }
}