// dependencies
var mysql = require("mysql");
var inquirer = require("inquirer");
var consoleTable = require("console.table");
var util = require('util')
// var other file = functions etc ?
var dept = [];
var managers = [];
var roleIds = [];

// create the connection information for sql database
var connection = mysql.createConnection({
    host: "localhost",

    // port
    port: 3306,
    // username
    user: "root",
    // your password
    password: "blh12345",
    database: "employees_db"
});

// connect to mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    console.log("connection made");
    // run the start function after connection to prompt user
    start();
    // connection.end();
    // console.log("connection ended.");
});
connection.query = util.promisify(connection.query)
// function for first prompt/asks user what action they want to take
function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "What would you like to do?",
            choices: ["Add Department", "Add Roles", "Add Employee", "View Departments", "View Roles", "View Employees", "Update Employee Role", "Exit"]
        })
        .then(function (answer) {
            // based on answer, run appropriate function
            if (answer.action === "Add Department") {
                addDepartment();
            }
            else if (answer.action === "Add Roles") {
                addRoles();
            }
            else if (answer.action === "Add Employee") {
                addEmployee();
            }
            else if (answer.action === "View Departments") {
                viewDepartment();
            }
            else if (answer.action === "View Roles") {
                viewRoles();
            }
            else if (answer.action === "View Employees") {
                viewEmployees();
            }
            else if (answer.action === "Update Employee Role") {
                updateRole();
            }
            else {
                connection.end();
            }
        });
}

// function to handle adding a new department
function addDepartment() {
    inquirer
        .prompt([
            {
                name: "addingdept",
                type: "input",
                message: "What is the name of the department you would like to add?"
            }

        ])
        .then(function (answer) {
            // when finished prompting, insert new department into db
            connection.query(
                "INSERT INTO departments SET ?",
                {
                    dept_name: answer.addingdept
                },
                function (err) {
                    if (err) throw err;
                    console.log("New department added successfully!");
                    // re-prompt if they would like to do something else
                    start();
                }
            );
        });
}
// function for generating departments list
function deptList() {
    return connection.query("SELECT id, dept_name FROM departments");
}
// function to handle adding a new department
async function addRoles() {
    const dep = await deptList();
    const depChoices = dep.map(({ id, dept_name }) => ({
        name: dept_name,
        value: id
    }))


    inquirer
        .prompt([
            {
                name: "title",
                type: "input",
                message: "What is the title of the role you're adding?"
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary for the role you're adding?"
            },
            {
                name: "department",
                type: "list",
                message: "what department is this role in",
                choices: depChoices
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert new role with following info
            connection.query(

                "INSERT INTO roles SET ?",
                {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: answer.department
                },
                function (err) {
                    if (err) throw err;
                    console.log("New role added successfully!");
                    // re-prompt if they would like to do something else
                    start();
                }
            );
        });
}

// function for generating role id list
function roleList() {
    return connection.query("SELECT id, title FROM roles");
}
// function for generating managers list
function mgrList() {
    return connection.query("SELECT id, first_name, last_name FROM employees");
}

async function addEmployee() {
    const rol = await roleList();
    const roleChoices = rol.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    const mgr = await mgrList();
    const mgrChoices = mgr.map(({ id, first_name, last_name }) => ({
        name: `${first_name} ${last_name}`,
        value: id
    }))
    inquirer
        .prompt([
            {
                name: "firstname",
                type: "input",
                message: "What is the employee's first name?"
            },
            {
                name: "lastname",
                type: "input",
                message: "What is the employee's last name?"
            },
            {
               
                name: "roleid",
                type: "list",
                message: "What is their role?",
                choices: roleChoices
            },
            {
                name: "managerid",
                type: "list",
                message: "Who is their manager?",
                choices: mgrChoices
            },
        ])
        .then(function (answer) {
            // when finished prompting, insert new role with following info
            connection.query(
                "INSERT INTO employees SET ?",
                {
                    first_name: answer.firstname,
                    last_name: answer.lastname,
                    role_id: answer.roleid,
                    manager_id: answer.managerid,
                },
                function (err) {
                    if (err) throw err;
                    console.log("New employee added successfully!");
                    // re-prompt if they would like to do something else
                    start();
                }
            );
        });
}
function viewDepartment() {
    console.log("here here")
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;
        console.table(res)
        start();
    });
};

function viewRoles() {
    connection.query("SELECT * FROM roles", function (err, res) {
        if (err) throw err;
        console.table(res)
        start();
    });
};

function viewEmployees() {
    connection.query("SELECT * FROM employees", function (err, res) {
        if (err) throw err;
        console.table(res)
        start();
    });
};

// function for generating employees list
function empList() {
    return connection.query("SELECT id, first_name, last_name FROM employees");
}

function updateRole() {
    var querynames = "select id, concat(first_name,' ', last_name) as name from employees";
    var queryRoles = "select id, title from roles";
    const names = [];
    const roles = [];
    connection.query(querynames, function (err, name) {
      if (err) throw err;
      for (var i = 0; i < name.length; i++) {
        names.push(name[i])
      }
      // console.log(names)
      connection.query(queryRoles, function (err, role) {
        if (err) throw err;
        for (var i = 0; i < role.length; i++) {
          roles.push(role[i].title)
        }
        // console.log(roles)
      })
  
      inquirer.prompt([
        {
          name: "namechoice",
          type: "list",
          message: "Whos role would you like to update?",
          choices: names
        },
        {
          name: "rolechoice",
          type: "list",
          message: "Select new role",
          choices: roles
        }
  
      ]).then(function (answer) {let names = answer.namechoice.split(" ")
      var queryroleId = "select id from roles where title = ?";
      var queryNameId = "select id from employees where first_name = ? and last_name = ?";
      var queryUpdate = "update employees set role_id = ? where id = ?"
  
      connection.query(queryNameId, [names[0], names[1]], function (err, nameId) {
        if (err) throw err;
        nameId = nameId[0].id;
        connection.query(queryroleId, answer.rolechoice, function (err, res) {
          if (err) throw err;
          roleId = res[0].id;
          // console.log("role ID")
          // console.log(roleId)
          connection.query(queryUpdate, [roleId, nameId], function (err, res) {
            if (err) throw err;
            console.log(`Updated ${answer.namechoice}'s roles to ${answer.rolechoice}`);
            start();
          })
        })
      })
  
    })
  })}