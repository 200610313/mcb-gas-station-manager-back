const sql = require("../models/db");
const XlsxPopulate = require("xlsx-populate");
const excel = require("exceljs");
const dateFormat = require("dateFormat");
const ShiftForm = require("../models/ShiftForm");
const ExpenseCategory = require("../models/ExpenseCategory");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Product = require("../models/Product");

exports.getByMonth = async (req, res, next) => {
  const { year, month } = req.params;
  try {
    const result = await ShiftForm.getByMonth(year, month);
    console.log(result);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send({ message: error });
  }
};

exports.download = async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const employees = await Employee.getAll();
  const expenseCategories = await ExpenseCategory.getAll();
  const customers = await Customer.getAll();
  const products = await Product.getAll();

  const getEmployeeNickNames = (eIds) => {
    let names = "";
    eIds.forEach((eId, index) => {
      const employee = employees.find((emp) => emp.eId === eId);
      if (index > 0) names = `${names}, ${employee.nickName}`;
      else names = `${employee.nickName}`;
    });
    return names;
  };
  try {
    const templatePath = "data/dsr-template.xlsx";
    const workbook = await XlsxPopulate.fromFileAsync(templatePath);

    const shiftForms = await ShiftForm.getBetweenDates(startDate, endDate);

    for (const shiftForm of shiftForms) {
      let { date, shift, placement } = shiftForm;
      date = dateFormat(new Date(date), "yyyy-m-d");
      let formData = await ShiftForm.get(date, shift, placement); // Fetch info about the shift form
      formData = {
        ...formData,
        expenseCategories,
        customers,
        products,
        employees,
      }; // Append constants

      const sheetName = `${date}-${placement}-${shift}`; // Set worksheet's name
      const sheet = workbook.cloneSheet(workbook.sheet("template"), sheetName); // Clone worksheet from template

      // Filling up worksheet //
      let target = null;

      // Fill-up basic info
      const { shiftDate, cashier, pumpAttendants } = formData;
      target = sheet.range("B1:B4");
      target.value([[shiftDate], [shift], [getEmployeeNickNames([cashier])], [getEmployeeNickNames(pumpAttendants)]]);
    }

    console.log("saving...");
    const data = await workbook.outputAsync();
    // // add worksheet
    res.attachment("bruhx.xlsx");
    res.send(data);

  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
};
exports.create = async (req, res, next) => {
  try {
    const {
      form,
      shiftEmployees,
      pumpGroupPrices,
      pumpInfos,
      dipstickReadings,
      dropForm,
      lastDropBreakDown,
      cashAdvances,
      expenses,
      creditSales,
    } = req.body;
    const shiftform = new ShiftForm({
      form,
      shiftEmployees,
      pumpGroupPrices,
      pumpInfos,
      dipstickReadings,
      dropForm,
      lastDropBreakDown,
      cashAdvances,
      expenses,
      creditSales,
    });
    const result = await ShiftForm.create(shiftform);
    res.status(200).send({ fId: result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", error });
  }
};
exports.update = async (req, res, next) => {
  try {
    const { fId } = req.params;
    const {
      form,
      shiftEmployees,
      pumpGroupPrices,
      pumpInfos,
      dipstickReadings,
      dropForm,
      lastDropBreakDown,
      cashAdvances,
      expenses,
      creditSales,
    } = req.body;
    const shiftForm = new ShiftForm({
      form,
      shiftEmployees,
      pumpGroupPrices,
      pumpInfos,
      dipstickReadings,
      dropForm,
      lastDropBreakDown,
      cashAdvances,
      expenses,
      creditSales,
    });
    const result = await ShiftForm.update(shiftForm, fId);
    console.log("successfully updated");
    res.status(200).send({ result });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", error });
  }
};

exports.get = async (req, res, next) => {
  try {
    const { year, month, day, shift } = req.params;
    const { placement } = req.query;
    const result = await ShiftForm.get(
      `${year}-${month}-${day}`,
      shift,
      placement
    );

    const employees = await Employee.getAll();
    const expenseCategories = await ExpenseCategory.getAll();
    const customers = await Customer.getAll();
    const products = await Product.getAll();

    // append form options
    const formData = {
      ...result,
      expenseCategories,
      customers,
      products,
      employees,
    };
    res.status(200).send(formData);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong", error });
  }
};
