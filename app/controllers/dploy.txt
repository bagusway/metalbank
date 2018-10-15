
// part 1

// 1. Factorial with recursive;
var factorials = function(req,res){	
	var x = req.body.x;
	function factorial(x){
    if(x===0){
        return 1;
    }
    else{
        return x * factorial(x-1);
    	}    
    }
}
// 2. 
	var fibonaci = function(req,res){
	function fibonacci(num) {
  if (num <= 1) {return 1;}
  else {
  return fibonacci(num - 1) + fibonacci(num - 2);
  }	
	}
  
}

// part 2

// 1. Sort array 
 var sorting = function(req,res){
 	var people = [req.body.name, req.body.age, req.body.us];
 	people.sort();
 	console.log(people);
 }

 // 2. change us

 var replace = function(req,res){
 	People.FindOne({people.us},function(err,us){
 		if(people.us == 'false'){
 			people.us = 'true';
 		}
 		else{
 			people.us='false'; 
 		}
 	});

 }

 // 3 change gender

 var gender = function(req,res){
 	People.FindOne({people.gender},function(err,gender){
 		if(people.gender == 'f'){
 			people.gender = 'female';
 		}
 		else{
 			people.us='male'; 
 		}
 	});

 }
 