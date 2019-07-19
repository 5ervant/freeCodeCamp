/*
*
*
*       Complete the handler logic below
*       
*       
*/

const units = ['gal', 'l', 'mi', 'km', 'lbs', 'kg'];

const getProduct = input => {
  const match = input.match(/[a-z]/i)[0];
  const prod = input.split(match)[0].trim();
  
  return prod;
}

const roundDecimals = num => {
  return Number(Number(num).toFixed(5));
}

function ConvertHandler() {
  
  this.getNum = function(input) {
    const prod = getProduct(input);
    const nums = prod.split('/');
    let result = nums[0];
    
    if (nums.length === 2) {
      for (let i = 1; i < nums.length; i++) {
        if (nums[i])
          result /= parseFloat(nums[i]);
        else
          return 'invalid number';
      }
    } else if (nums.length > 2) {
      return 'invalid number';
    }
    
    return result ? result : 1;
  };
  
  this.getUnit = function(input) {
    const prod = getProduct(input);
    
    let unit = input.replace(prod, '');
    unit = unit.trim().toLowerCase();
    
    const isValid = units.some(el => (unit === el));
    if (!isValid) return 'invalid unit';
    
    return unit;
  };
  
  this.getReturnUnit = function(initUnit) {
    const expect = ['l', 'gal', 'km', 'mi', 'kg', 'lbs'];
    
    return expect[units.indexOf(initUnit)];
  };

  this.spellOutUnit = function(unit) {
    const expect = ['gallons', 'liters', 'miles', 'kilometers', 'pounds', 'kilograms'];
    
    return expect[units.indexOf(unit)];
  };
  
  this.convert = function(initNum, initUnit) {
    const galToL  = 3.78541;
    const lbsToKg = 0.453592;
    const miToKm  = 1.60934;
    let result;

    switch(initUnit) {
      case 'gal':
        result = initNum * galToL;
        break;
      case 'lbs':
        result = initNum * lbsToKg;
        break;
      case 'mi':
        result = initNum * miToKm;
        break;
      case 'l':
        result = initNum / galToL;
        break;
      case 'kg':
        result = initNum / lbsToKg;
        break;
      case 'km':
        result = initNum / miToKm;
        break;
      default:
    }
    
    return result;
  };
  
  this.getString = function(initNum, initUnit, returnNum, returnUnit) {
    initNum = roundDecimals(initNum);
    returnNum = roundDecimals(returnNum);
    
    const initial_Units = this.spellOutUnit(initUnit);
    const return_Units = this.spellOutUnit(returnUnit);
    
    return `${initNum} ${initial_Units} converts to ${returnNum} ${return_Units}`;
  };
  
}

module.exports = ConvertHandler;
