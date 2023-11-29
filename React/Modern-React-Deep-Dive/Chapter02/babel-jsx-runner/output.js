const foo = () => {
	console.log('hi');
};
const ComponentA = /*#__PURE__*/ React.createElement(
	'div',
	null,
	/*#__PURE__*/ React.createElement(
		A,
		{
			onClick: onclick,
		},
		'click!'
	)
);
