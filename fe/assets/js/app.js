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
});

app.directive('customDoubleClick', function(ScopeHandler) {
  return {
    link: function(scope, element, attr) {
      element.on('dblclick', function(event) {
        event.preventDefault();
        scope.$emit('Edit', scope.$index);
        // console.log(scope.employee.id);
        // let createControllerScope = ScopeHandler.getScope('createController');
        // let employeeList = createControllerScope.employees.map(employee=>{
        //   // console.log(employee);
        //   if(employee.id === scope.employee.id){
        //     return {
        //       ...employee,
        //       isDisabled : false,
        //       isEdit : true,
        //       isUpdate : false
        //     }
        //   }
        //   return employee;
        // });
        // createControllerScope.employees = employeeList;

      });
    }
  };
});

app.factory('ScopeHandler', function() {
  return {
      scopeFactory:{},
      setScope: function(scopeName, scope) {
        this.scopeFactory[scopeName] = scope;
      },
      getScope: function(scopeName){
        return this.scopeFactory[scopeName]
      }
  };
});

app.controller("createController", function($scope, $http, ScopeHandler, $timeout) {
    $scope.employees = { list: [] };
    ScopeHandler.setScope('createController', $scope);

    const getAllEmployee = () => {
      $http.get("http://127.0.0.1:8000/employees/").then(response => {
        let employeeList = response.data;
        $scope.employees.list = employeeList.map(employee => {
          return {
            ...employee,
            isDisabled: true,
            isEdit: false,
            isUpdate: true
          };
        });
      });
    }


    $scope.addTodo = function() {
      let name = $scope.name;
      let email = $scope.email;
      let sex = $scope.sex;
      let employee = { name, email, sex };
      if (employee && employee.name && employee.email && employee.sex) {
        $http.post('http://127.0.0.1:8000/employees/', employee).then((data)=>{
          if(data.status === 201){
            $scope.name = '';
            $scope.email = '';
            $scope.sex = '';
            getAllEmployee();
          }
        })
        }
    };

    getAllEmployee();

    $scope.deleteTodo = function(id, employee) {
      $http.delete("http://127.0.0.1:8000/employees/" + employee.id + "/")
      .then(data => {
        if(data.status === 204){
          getAllEmployee();
        }
      })
    };

    $scope.editTodo = function(id) {
      $timeout( function(){
        let newEmployeeList = angular.copy($scope.employees.list)
        $scope.employees.list = []
        newEmployeeList[id].isDisabled = false;
        newEmployeeList[id].isEdit = true;
        newEmployeeList[id].isUpdate = false;
        $scope.employees.list = [...newEmployeeList]
    }, 0 );
    };

    $scope.$on('Edit', function(event, id) {
      $scope.editTodo(id);
    });

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