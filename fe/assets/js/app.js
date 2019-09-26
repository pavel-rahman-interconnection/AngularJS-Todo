var app = angular.module("todo", ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when("/home", {
        templateUrl : "pages/home.html"
    })
    .when("/create-employee", {
        templateUrl : "pages/createEmployee.html"
    })
    .when("/employee-list", {
        templateUrl : "pages/employeeList.html"
    })
});

app.directive('customTable', function(){
    return {
        templateUrl:'pages/custom-form.html'
    }
})


app.controller("createController", function($scope, $http) {
    $http.get("http://127.0.0.1:8000/employees/").then(response => {
      let employeeList = response.data;
      $scope.employees = employeeList.map(employee => {
        return { ...employee, isDisabled: true, isEdit: false, isUpdate: true };
      });
    });
    $scope.addTodo = function() {
      let name = $scope.name;
      let email = $scope.email;
      let sex = $scope.sex;
      let employee = { name, email, sex };
      console.log(employee);
      if (employee && employee.name && employee.email && employee.sex) {
        $http.post('http://127.0.0.1:8000/employees/', employee).then((data)=>{
          console.log(data);
          if(data.status === 201){
            $scope.name = '';
            $scope.email = '';
            $scope.sex = '';
            getAllEmployee();
          }
        })
        }
    };
    const getAllEmployee = () => {
      $http.get("http://127.0.0.1:8000/employees/").then(response => {
        let employeeList = response.data;
        $scope.employees = employeeList.map(employee => {
          return {
            ...employee,
            isDisabled: true,
            isEdit: false,
            isUpdate: true
          };
        });
      });
    }
    $scope.deleteTodo = function(id, employee) {
      $http.delete("http://127.0.0.1:8000/employees/" + employee.id + "/")
      .then(data => {
        if(data.status === 204){
          getAllEmployee();
        }
      })
    };
    $scope.editTodo = function(id) {
      $scope.employees[id].isDisabled = false;
      $scope.employees[id].isEdit = true;
      $scope.employees[id].isUpdate = false;
    };
    $scope.updateTodo = function(id, employee) {
      let updatedEmployee = {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        sex: employee.sex
      };
      $http
        .patch(
          "http://127.0.0.1:8000/employees/" + employee.id + "/",
          updatedEmployee
        )
        .then(data => {
          if (data.status === 200) {
            $http.get("http://127.0.0.1:8000/employees/").then(response => {
              if(response.status === 200){
                getAllEmployee();
              }
            });
          }
        });
    };
  });