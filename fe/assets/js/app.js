var app = angular.module("todo", ["ngRoute", "oitozero.ngSweetAlert"]);
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

app.controller("listController", function($scope, $http, ScopeHandler, $timeout){
  $scope.employees = { list: [] };
  let getAllEmployee = () => {
    $http.get("http://127.0.0.1:8000/employees/").then(response => {
      let employeeList = response.data;
      $scope.employees.list = employeeList.map(employee => {
        return {
          ...employee,
          isDisabled: true,
          isEdit: false,
          isUpdate: true,
          invalidEmail : false,
          emailErrorMessage : '',
          invalidName : false,
          nameErrorMessage : '',
          invalidSex : false,
          sexErrorMessage : '',
        };
      });
    });
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
    }, 0);
  };

  $scope.$on('Edit', function(event, id) {
    $scope.editTodo(id);
  });

  const validateEmployeeInfo = (employee, $scope, id) => {
    let valid = true;
    const regex = {
      email:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      name:/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
    };
    if(employee.email){
      if(!regex.email.test(employee.email)){
        $timeout( function(){
          let newEmployeeList = angular.copy($scope.employees.list)
          $scope.employees.list = []
          newEmployeeList[id].invalidEmail = true;
          newEmployeeList[id].emailErrorMessage = 'Please enter a valid email address.';
          $scope.employees.list = [...newEmployeeList]
        }, 0);
        valid = false;
      }
    };
    if(!employee.email){
      $timeout( function(){
        let newEmployeeList = angular.copy($scope.employees.list)
        $scope.employees.list = []
        newEmployeeList[id].invalidEmail = true;
        newEmployeeList[id].emailErrorMessage = 'This field can not be empty.';
        $scope.employees.list = [...newEmployeeList]
      }, 0);
      valid = false;
    };
    if(employee.name){
      if(!regex.name.test(employee.name)){
        $timeout( function(){
          let newEmployeeList = angular.copy($scope.employees.list)
          $scope.employees.list = []
          newEmployeeList[id].invalidName = true;
          newEmployeeList[id].nameErrorMessage = 'Please enter a valid name.';
          $scope.employees.list = [...newEmployeeList]
        }, 0);
        valid = false;
      }
    };
    if(!employee.name){
      $timeout( function(){
        let newEmployeeList = angular.copy($scope.employees.list)
        $scope.employees.list = []
        newEmployeeList[id].invalidName = true;
        newEmployeeList[id].nameErrorMessage = 'This field can not be empty.';
        $scope.employees.list = [...newEmployeeList]
      }, 0);
      valid = false;
    };
    if(!employee.sex){
      $timeout( function(){
        let newEmployeeList = angular.copy($scope.employees.list)
        $scope.employees.list = []
        newEmployeeList[id].invalidSex = true;
        newEmployeeList[id].sexErrorMessage = 'Please select at least one option.'
        $scope.employees.list = [...newEmployeeList]
      }, 0);
      valid = false;
    };
    return valid;
  }

  $scope.onChange = function(type, value, id){
    if(type === 'email'){
      $scope.employees.list[id].invalidEmail = false;
      $scope.employees.list[id].emailErrorMessage = '';
    }
    if(type === 'name'){
      $scope.employees.list[id].invalidName = false;
      $scope.employees.list[id].nameErrorMessage = '';
    }
    if(type === 'gender'){
      $scope.employees.list[id].invalidSex = false;
      $scope.employees.list[id].sexErrorMessage = '';
    }
  }

  $scope.updateTodo = function(id, employee) {
    let updatedEmployee = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      sex: employee.sex
    };

    let formValid = validateEmployeeInfo(employee, $scope, id)
    if(formValid){
      $http.patch(
        "http://127.0.0.1:8000/employees/" + employee.id + "/",
        updatedEmployee
    ).then(data => {
      if (data.status === 200) {


        $timeout( function(){
          let newEmployeeList = angular.copy($scope.employees.list)
          $scope.employees.list = []
          newEmployeeList[id].isDisabled = true;
          newEmployeeList[id].isEdit = false;
          newEmployeeList[id].isUpdate = true;
          $scope.employees.list = [...newEmployeeList]
        }, 0);
      }
    });
    }
  };

});

app.controller("createController", function($scope, $http, ScopeHandler, $timeout, SweetAlert) {
  ScopeHandler.setScope('createController', $scope);

  const validateEmployeeInfo = (employee, $scope) => {
    let valid = true;
    const regex = {
      email:/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      name:/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/,
    };
    if(employee.email){
      if(!regex.email.test(employee.email)){
        $scope.invalidEmail = true;
        $scope.emailErrorMessage = 'Please enter a valid email address.'
        valid = false;
      }
    };
    if(!employee.email){
      $scope.invalidEmail = true;
      $scope.emailErrorMessage = 'This field can not be empty.'
      valid = false;
    };
    if(employee.name){
      if(!regex.name.test(employee.name)){
        $scope.invalidName = true;
        $scope.nameErrorMessage = 'Please enter a valid name.'
        valid = false;
      }
    };
    if(!employee.name){
      $scope.invalidName = true;
      $scope.nameErrorMessage = 'This field can not be empty.'
      valid = false;
    };
    if(!employee.sex){
      $scope.invalidSex = true;
      $scope.sexErrorMessage = 'Please select at least one option.'
      valid = false;
    };
    return valid;
  }

  $scope.onChange = function(type, value){
    if(type === 'email'){
      $scope.invalidEmail = false;
      $scope.emailErrorMessage = '';
    }
    if(type === 'name'){
      $scope.invalidName = false;
      $scope.nameErrorMessage = '';
    }
    if(type === 'gender'){
      $scope.invalidSex = false;
      $scope.sexErrorMessage = '';
    }
  }

  $scope.addTodo = function() {
    let name = $scope.name;
    let email = $scope.email;
    let sex = $scope.sex;
    let employee = { name, email, sex };
    let formValid = validateEmployeeInfo(employee, $scope);
    if (formValid) {
      SweetAlert.swal(
        'Employee Created Successfully',
      )
      $http.post('http://127.0.0.1:8000/employees/', employee).then((data)=>{
        if(data.status === 201){
          $scope.name = '';
          $scope.email = '';
          $scope.sex = '';
        }
      })
    }
  };
});