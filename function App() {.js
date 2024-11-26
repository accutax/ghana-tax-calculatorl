function App() {
  // State management for form inputs and calculations
  const [formData, setFormData] = React.useState({
    taxYear: '2024',
    basicIncome: '',
    allowances: '',
    taxRelief: '',
  });
  const [results, setResults] = React.useState(null);
  const [errors, setErrors] = React.useState({});

  // Tax brackets for different years
  const taxBrackets = {
    2024: [
      { threshold: 402, rate: 0 },
      { threshold: 550, rate: 5 },
      { threshold: 670, rate: 10 },
      { threshold: 3000, rate: 17.5 },
      { threshold: 16461, rate: 25 },
      { threshold: Infinity, rate: 30 }
    ]
  };

  // SSNIT calculation (5.5% of basic salary)
  const calculateSSNIT = (basicIncome) => basicIncome * 0.055;

  // Calculate tax based on brackets
  const calculateTax = (taxableIncome, year) => {
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    let previousThreshold = 0;

    taxBrackets[year].forEach(bracket => {
      const taxableAmount = Math.min(
        remainingIncome,
        bracket.threshold - previousThreshold
      );
      totalTax += (taxableAmount * bracket.rate) / 100;
      remainingIncome -= taxableAmount;
      previousThreshold = bracket.threshold;
    });

    return totalTax;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.basicIncome) newErrors.basicIncome = 'Basic income is required';
    if (formData.basicIncome < 0) newErrors.basicIncome = 'Basic income cannot be negative';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Calculations
    const basicIncome = parseFloat(formData.basicIncome);
    const allowances = parseFloat(formData.allowances) || 0;
    const taxRelief = parseFloat(formData.taxRelief) || 0;

    const grossIncome = basicIncome + allowances;
    const ssnitContribution = calculateSSNIT(basicIncome);
    const taxableIncome = grossIncome - ssnitContribution - taxRelief;
    const payeTax = calculateTax(taxableIncome, formData.taxYear);
    const netIncome = grossIncome - ssnitContribution - payeTax;

    setResults({
      grossIncome,
      ssnitContribution,
      taxableIncome,
      payeTax,
      netIncome
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Ghana Tax Calculator 2024</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tax Year Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax Year</label>
                    <select
                      name="taxYear"
                      value={formData.taxYear}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>

                  {/* Basic Income Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Basic Income (GH₵)
                    </label>
                    <input
                      type="number"
                      name="basicIncome"
                      value={formData.basicIncome}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.basicIncome ? 'border-red-500' : 'border-gray-300'
                      } focus:border-indigo-500 focus:ring-indigo-500`}
                    />
                    {errors.basicIncome && (
                      <p className="text-red-500 text-sm mt-1">{errors.basicIncome}</p>
                    )}
                  </div>

                  {/* Allowances Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly Allowances (GH₵)
                    </label>
                    <input
                      type="number"
                      name="allowances"
                      value={formData.allowances}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Tax Relief Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Relief (GH₵)
                    </label>
                    <input
                      type="number"
                      name="taxRelief"
                      value={formData.taxRelief}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Calculate
                  </button>
                </form>

                {/* Results Section */}
                {results && (
                  <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4">Results</h2>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Gross Income:</span>
                        <span className="font-medium">GH₵ {results.grossIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SSNIT Contribution:</span>
                        <span className="font-medium">GH₵ {results.ssnitContribution.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span className="font-medium">GH₵ {results.taxableIncome.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PAYE Tax:</span>
                        <span className="font-medium">GH₵ {results.payeTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-indigo-600 pt-2 border-t">
                        <span>Net Income:</span>
                        <span>GH₵ {results.netIncome.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}