var comQuery = {
	// 字段列表 field = { name : "", value : "", type : 0, viewStyle : "" }
	fields : new Array(),
	// 条件列表 condition = {left : "", fieldValue : "", operator : "", value_1 : "", value_2 : "", right : "", logic : ""}
	conditions : new Array(),
	// 游标
	maxId : 1,
	// 查询字段列的宽度
	fieldColWidth : 100,
	
	calIcon : "",
	
	fieldOptions : null,
	
	resource : null,
	
//	sb.append("comQuery.submitFunc='" + this.getSubmitFunc() + "';");
//	sb.append("comQuery.savePath='" + this.getSavePath() + "';");
	/**
	 *下面这三个方法需要用户自己定义
	 */
	// 保存
	save : function() {
		if (comQuery.savePath != null && comQuery.savePath != "") {
			var returnStr=window.showModalDialog(comQuery.cp + "/reportServlet?action=" + comQuery.action + "&type=bs&path="+comQuery.savePath);
			if (returnStr != null && returnStr.length > 0) {
				$("saveIframe").src = comQuery.cp + "/reportServlet?action=" + comQuery.action + "&type=s&name=" + returnStr + "&value=" + comQuery.genConditions() + "&path="+comQuery.savePath;
			}
		} else 
			alert(comQuery.resource.res13.replaceAll("<br>", "\n\r"));
	},
	// 载入已定义
	reload : function() {
		if (comQuery.savePath != null && comQuery.savePath != "") {
			var returnStr=window.showModalDialog(comQuery.cp + "/reportServlet?action=" + comQuery.action + "&type=l&path="+comQuery.savePath);
			if (returnStr != null && returnStr.length > 0) {
				comQuery.resetConditions(returnStr);
			}
		} else 
			alert(comQuery.resource.res14.replaceAll("<br>", "\n\r"));
	},
	// 查询
	query : function() {
		if (comQuery.submitFunc != null && comQuery.submitFunc != '') {
			eval(comQuery.submitFunc + "()");
		} else
			alert(comQuery.resource.res15.replaceAll("<br>", "\n\r"));
	},
	
	
	// 根据 fields, conditions 初始化界面
	init : function() {
		comQuery.maxId = 1;
		var senior = false;
		comQuery.fieldOptions = null;
		for (var i=100; i>=1 ; i--) {
			try {
				$('conditionTable').deleteRow(i);
			} catch(e) {}
		}
		for (var i=0; i<comQuery.conditions.length; i++) {
			var condition = comQuery.conditions[i];
			comQuery.addRow();
			comQuery.refreshAddBut();
			
			var id = comQuery.maxId;
			$("left_" + id).value = condition.left;
			$("field_" + id).value = condition.fieldValue;
			comQuery.changeField(id);
			$("operator_" + id).value = condition.operator;
			comQuery.changeOperator(id);
			$("inputText_1_" + id).value = condition.value_1;
			if ($("inputText_2_" + id)) $("inputText_2_" + id).value = condition.value_2;
			$("right_" + id).value = condition.right;
			$("logic_" + id).value = condition.logic;
			
			if (condition.left != "" || condition.right != "" || condition.logic == "or") senior = true;
		}
		if (comQuery.conditions.length == 0) {
			comQuery.addRow();
		}
		
		if (!senior) {
			$("switchBut").innerHTML = comQuery.resource.res1;
			comQuery.switchMode(false);
		} else {
			$("switchBut").innerHTML = comQuery.resource.res2;
			comQuery.switchMode(true);
		}
	},
	
	genSql : function() {
		var conds = comQuery.genConditionsObj();
		var sql = "";
		for (var i=0; i<conds.length; i++) {
			var condition = conds[i];
			sql += condition.left;
			sql += comQuery.getCondByOper(condition.fieldValue, condition.operator, condition.value_1, condition.value_2);
			sql += condition.right;
			if (i != conds.length - 1) sql += " " + condition.logic + " ";
		}
		return sql;
	},
	
	getCondByOper : function(field, oper, value_1, value_2) {
		var result = "";
		var fieldObj = comQuery.getFieldByValue(field);
		switch (oper) {
			case 's_1' : 
			case 'i_1' : 
			case 'd_1' : 
				return field + " = " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_2' : 
			case 'i_2' : 
			case 'd_2' : 
				return field + " <> " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_3' : 
			case 'i_3' : 
			case 'd_3' : 
				return field + " > " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_4' : 
			case 'i_4' : 
			case 'd_4' : 
				return field + " >= " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_5' : 
			case 'i_5' : 
			case 'd_5' : 
				return field + " < " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_6' : 
			case 'i_6' : 
			case 'd_6' : 
				return field + " <= " + comQuery.getDBConst(value_1, fieldObj.type);
			case 's_7' : 
			case 'i_7' : 
			case 'd_7' : 
				return field + " is null";
			case 's_8' : 
			case 'i_8' : 
			case 'd_8' : 
				return field + " is not null";
			case 's_9' : 
				var values = value_1.split(" ");
				for (var i=0; i<values.length; i++) {
					if (values[i].trim() != "") 
						result += " or " + field + " like '%" + values[i] + "%'"
				}
				result = result.substring(4)
				return "(" + result + ")";
			case 's_10' : 
				var values = value_1.split(" ");
				for (var i=0; i<values.length; i++) {
					if (values[i].trim() != "") 
						result += " and " + field + " not like '%" + values[i] + "%'"
				}
				result = result.substring(5)
				return "(" + result + ")";
			case 'i_9' : 
			case 'd_9' : 
				return "(" + field + " > " + comQuery.getDBConst(value_1, fieldObj.type) +" and " + field + " < " + comQuery.getDBConst(value_2, fieldObj.type) + ")";
			case 'i_10' : 
			case 'd_10' : 
				return "(" + field + " >= " + comQuery.getDBConst(value_1, fieldObj.type) +" and " + field + " <= " + comQuery.getDBConst(value_2, fieldObj.type) + ")";
			case 'i_11' : 
			case 'd_11' : 
				return "(" + field + " < " + comQuery.getDBConst(value_1, fieldObj.type) +" or " + field + " > " + comQuery.getDBConst(value_2, fieldObj.type) + ")";
			case 'i_12' : 
			case 'd_12' : 
				return "(" + field + " <= " + comQuery.getDBConst(value_1, fieldObj.type) +" or " + field + " >= " + comQuery.getDBConst(value_2, fieldObj.type) + ")";
		}
	},

	genConditions : function() {
		var conds = comQuery.genConditionsObj();
		var result = "";
		for (var i=0; i<conds.length; i++) {
			var cond = conds[i];
			result += cond.left + "," + cond.fieldValue + "," + cond.operator + "," + cond.value_1 + "," + cond.value_2 + "," + cond.right + "," + cond.logic; 
			if (i != conds.length - 1) result += ";"
		}
		return result;
	},
		
	// 根据界面，生成条件列表对象
	genConditionsObj : function() {
		var conds = new Array();
		var rows = $('conditionTable').rows;
		for (var i=0; i<rows.length; i++) {
			if (rows[i].id) {
				var id = rows[i].id.substring(3);
				var oper = $("operator_" + id).value;
				if (oper != "s_7" && oper != "s_8" && oper != "i_7" && oper != "i_8" && oper != "d_7" && oper != "d_8") {
					if ($("inputText_1_" + id).value.trim() == "" || ($("inputText_2_" + id) && $("inputText_2_" + id).value.trim() == "")) {
						continue;
					}
				}
				
				var condition = new Object();
				condition.left = $("left_" + id).value.trim();
				condition.fieldValue = $("field_" + id).value.trim();
				condition.operator = oper;
				condition.value_1 = $("inputText_1_" + id).value.trim();
				condition.value_2 = $("inputText_2_" + id) ? $("inputText_2_" + id).value.trim() : "";
				condition.right = $("right_" + id).value.trim();
				condition.logic = $("logic_" + id).value.trim();
				conds[conds.length] = condition;
			}
		}
		return conds;
	},
	
	resetConditions : function(conditions) {
		comQuery.conditions = new Array();
		var cs = conditions.split(";");
		for (var i = 0; i < cs.length; i++) {
			var cond = cs[i];
			var temp = cond.split(",");
			if (temp.length == 7) {
				var condition={left: temp[0], fieldValue:temp[1],operator:temp[2],value_1:temp[3],value_2:temp[4],right:temp[5],logic:temp[6]};
				comQuery.conditions[i] = condition;
			}
		}
		comQuery.init();
	},
	
	resetFields : function(fields) {
		
	},
	
	// 添加一个新行，返回该新行
	addRow : function() {
		var senior = $("switchBut").innerHTML == comQuery.resource.res1;
		comQuery.maxId++;
		var tr = $('conditionTable').insertRow(-1);
		tr.id = "id_" + comQuery.maxId;

		var td = tr.insertCell(-1);
		td.innerHTML = '<input id="left_' + comQuery.maxId + '" type="text" size="6">';
		td.align = "right";
		td.style.width = '50px';
		if (!senior) td.style.display = "none";

		td = tr.insertCell(-1)
		td.innerHTML = '<select id="field_' + comQuery.maxId + '" style="width:100%" onchange="comQuery.changeField(' + comQuery.maxId + ');">' + comQuery.getFieldOptions() + '</select>';
		td.style.width = '120px';

		td = tr.insertCell(-1);
		td.innerHTML = '<select id="operator_' + comQuery.maxId + '" style="width:100%" onchange="comQuery.changeOperator(' + comQuery.maxId + ');">' + comQuery.getOperators(comQuery.fields[0]) + '</select>';
		td.style.width = '13px';
		
		td = tr.insertCell(-1);
		td.innerHTML = comQuery.getInputTexts(comQuery.maxId);
		td.style.width = '180px';

		td = tr.insertCell(-1);
		td.innerHTML = '<input id="right_' + comQuery.maxId + '" type="text" size="6">';
		td.style.width = '50px';
		if (!senior) td.style.display = "none";
		
		td = tr.insertCell(-1);
		td.innerHTML = '<select style="width:100%" id="logic_' + comQuery.maxId + '"><option value="and">' + comQuery.resource.res16 + '</option><option value="or">' + comQuery.resource.res17 + '</option></select>';
		td.style.width = '70px';
		if (!senior) td.style.display = "none";	
		
		td = tr.insertCell(-1);
		td.innerHTML = '<a href="javascript:void(0);" onclick="comQuery.removeRow(' + comQuery.maxId + ');" style="color:red">' + comQuery.resource.res42 + '</a>&nbsp;&nbsp;<a href="javascript:void(0);" id="addBut_' + comQuery.maxId + '" onclick="this.style.visibility=\'hidden\';comQuery.addRow();" style="color:green; visibility:visible">' + comQuery.resource.res18 + '</a>';
		td.style.width = '100px';
		td.align = "center";
	},
	
	removeRow : function(id) {
		var rows = $('conditionTable').rows;
		for (var i=0; i<rows.length; i++) {
			if (rows[i].id == "id_" + id) {
				$('conditionTable').deleteRow(i);
				if (rows.length == 1)
					comQuery.addRow();
				comQuery.refreshAddBut();
				return;
			}
		}
	},
	
	getFieldOptions : function() {
		if (comQuery.fieldOptions == null) {
			comQuery.fieldOptions = "";
			for (var i=0; i<comQuery.fields.length; i++) {
				var field = comQuery.fields[i];
				comQuery.fieldOptions += "<option value='" + field.value + "'>" + field.name + "</option>";
			}
		} 
		return comQuery.fieldOptions;
	},

	// 根据不同字段的类型返回不同操作符集合。
	// TODO 数据类型与操作符的对应关系需要确认。
	getOperators : function(field) {
		var type = 0;
		if (field) 
			type = field.type; 
		var operators = "";

		if (type == 0) { // 字符串
			operators = '<option value="s_1">' + comQuery.resource.res19 + '</option>';
			operators += '<option value="s_2">' + comQuery.resource.res20 + '</option>';
			operators += '<option value="s_3">' + comQuery.resource.res21 + '</option>';
			operators += '<option value="s_4">' + comQuery.resource.res22 + '</option>';
			operators += '<option value="s_5">' + comQuery.resource.res23 + '</option>';
			operators += '<option value="s_6">' + comQuery.resource.res24 + '</option>';
			operators += '<option value="s_7">' + comQuery.resource.res25 + '</option>';
			operators += '<option value="s_8">' + comQuery.resource.res26 + '</option>';
			if (field && field.viewStyle.length > 0 && field.viewStyle.indexOf("cal") == 0) {
				operators += '<option value="s_11">' + comQuery.resource.res27 + '</option>';
				operators += '<option value="s_12">' + comQuery.resource.res28 + '</option>';
				operators += '<option value="s_13">' + comQuery.resource.res29 + '</option>';
				operators += '<option value="s_14">' + comQuery.resource.res30 + '</option>';
			} else {
				operators += '<option value="s_9">' + comQuery.resource.res31 + '</option>';
				operators += '<option value="s_10">' + comQuery.resource.res32 + '</option>';
			} 
		} else if(type == 1) { // 数值
			operators = '<option value="i_1">' + comQuery.resource.res19 + '</option>';
			operators += '<option value="i_2">' + comQuery.resource.res20 + '</option>';
			operators += '<option value="i_3">' + comQuery.resource.res21 + '</option>';
			operators += '<option value="i_4">' + comQuery.resource.res22 + '</option>';
			operators += '<option value="i_5">' + comQuery.resource.res23 + '</option>';
			operators += '<option value="i_6">' + comQuery.resource.res24 + '</option>';
			operators += '<option value="i_7">' + comQuery.resource.res25 + '</option>';
			operators += '<option value="i_8">' + comQuery.resource.res26 + '</option>';
			operators += '<option value="i_9">' + comQuery.resource.res33 + '</option>';
			operators += '<option value="i_10">' + comQuery.resource.res34 + '</option>';
			operators += '<option value="i_11">' + comQuery.resource.res35 + '</option>';
			operators += '<option value="i_12">' + comQuery.resource.res36 + '</option>';
		} else if(type == 2 || type == 3 || type == 4) { // 日期、日期时间、时间
			operators = '<option value="d_1">' + comQuery.resource.res19 + '</option>';
			operators += '<option value="d_2">' + comQuery.resource.res20 + '</option>';
			operators += '<option value="d_3">' + comQuery.resource.res37 + '</option>';
			operators += '<option value="d_4">' + comQuery.resource.res38 + '</option>';
			operators += '<option value="d_5">' + comQuery.resource.res39 + '</option>';
			operators += '<option value="d_6">' + comQuery.resource.res40 + '</option>';
			operators += '<option value="d_7">' + comQuery.resource.res25 + '</option>';
			operators += '<option value="d_8">' + comQuery.resource.res26 + '</option>';
			operators += '<option value="d_9">' + comQuery.resource.res27 + '</option>';
			operators += '<option value="d_10">' + comQuery.resource.res28 + '</option>';
			operators += '<option value="d_11">' + comQuery.resource.res29 + '</option>';
			operators += '<option value="d_12">' + comQuery.resource.res30 + '</option>';
		}
		return operators;
	},
	
	// 获得条件值地文本输入框
	getInputTexts : function(id) {
	
		var field = comQuery.getFieldByValue($("field_" + id).value);
		
		var pattern = "yyyy-MM-dd";
		var calSepa = "-";
		// 根据显示风格显示
		var isCal = false;
		if (field) {
			if (field.viewStyle.length > 0) {
				var separator = field.viewStyle.indexOf("|");
				if (separator > 0) {
					var type = field.viewStyle.substring(0, separator);
					var contents = field.viewStyle.substring(separator + 1).split(";");
					switch (type) {
						case "cal" :
							isCal = true;
							pattern = contents[0];
							calSepa = contents[1];
							break;
						case "select" :
							var select = '<select style="width:98%" id="inputText_1_' + id + '">';
							for (var i=0; i<contents.length; i++) {
								var temp = contents[i].split(",");
								select += '<option value="' + temp[0] + '">' + temp[1] + '</option>'
							}
							select += "</select>"
							return select;
						case "checkbox" :
							var align = (contents[3] && contents[3]==2 ? "right" : "left");
							return '<div align="' + align + '"><input type="checkbox" value="' + contents[1] + '" id="inputText_1_' + id + '" onclick="if(this.checked)this.value=\'' + contents[0] + '\';else this.value=\'' + contents[1] + '\'">' + contents[2] + "</div>";
					}
				}
			} else {
				switch (field.type) {
					case 2 : 
						pattern = "yyyy-MM-dd";
						break;
					case 3 : 
						pattern = "yyyy-MM-dd HH:mm:ss";
						break;
					case 4 : 
						pattern = "HH:mm:ss";
						break;
				} 
			}
		}
		var operator = $("operator_" + id).value;
		if (operator == 'i_9' || operator == 'i_10' || operator == 'i_11' || operator == 'i_12') {
			return '<input style="width:45%" id="inputText_1_' + id + '" type="text" size="6">-<input style="width:45%" id="inputText_2_' + id + '" type="text" size="6">';
		} else if ((operator == 'd_9' || operator == 'd_10' || operator == 'd_11' || operator == 'd_12' || operator == 's_11' || operator == 's_12' || operator == 's_13' || operator == 's_14')) {
			return '<input style="width:45%;BACKGROUND-IMAGE:url(' + comQuery.calIcon + '); background-position:center right; BACKGROUND-REPEAT: no-repeat;" id="inputText_1_' + id + '" type="text" size="6" onclick="_runqianCalendar.separator=\'' + calSepa + '\';_runqianCalendar.dateFormat =\'' + pattern + '\';_runqianCalendar.type=\'date\';_showCalendar(event);">-<input style="width:45%;BACKGROUND-IMAGE:url(' + comQuery.calIcon + '); background-position:center right; BACKGROUND-REPEAT: no-repeat;" id="inputText_2_' + id + '" type="text" size="6" onclick="_runqianCalendar.separator=\'' + calSepa + '\';_runqianCalendar.dateFormat=\'' + pattern + '\';_runqianCalendar.type=\'date\';_showCalendar(event);">';
		} else if (operator && operator.charAt(0) == "d" || isCal) {
			return '<input style="width:98%;BACKGROUND-IMAGE:url(' + comQuery.calIcon + '); background-position:center right; BACKGROUND-REPEAT: no-repeat;" id="inputText_1_' + id + '" type="text" size="6" onclick="_runqianCalendar.separator=\'' + calSepa + '\';_runqianCalendar.dateFormat =\'' + pattern + '\';_runqianCalendar.type=\'date\';_showCalendar(event);">';
		} else {
			return '<input style="width:98%" id="inputText_1_' + id + '" type="text" size="6">';
		}
	},

	// 字段改变时触发
	changeField : function(id) {
		var field = comQuery.getFieldByValue($("field_" + id).value);
		$("operator_" + id).parentNode.innerHTML = '<select id="operator_' + id + '" style="width:100%" onchange="comQuery.changeOperator(' + id + ');">' + comQuery.getOperators(field) + '</select>'
		comQuery.changeOperator(id);
	},

	// 操作符改变时触发
	changeOperator : function(id) {
		if ($("field_" + id).value == "") return;
		$("inputText_1_" + id).parentNode.innerHTML = comQuery.getInputTexts(id);
	},
	
	//
	getFieldByValue : function(value) {
		for (var i=0; i<comQuery.fields.length; i++) {
			var field = comQuery.fields[i];
			if (value == field.value) return field;
		}
	},

/*	
	getLastId : function() {
		var rows = $('conditionTable').rows;
		if (rows.length > 0) {
			var lastId = rows[rows.length-1].id;
			if (lastId) 
				return lastId.substring(3); // 去掉“id_”以获得序号
		}
	}
*/
	// 刷新“添加”按钮的可见状态。
	refreshAddBut : function() {
		var rows = $('conditionTable').rows;
		for (var i=0; i<rows.length; i++) {
			var lastId = rows[i].id;
			if (lastId) {
				lastId = lastId.substring(3);
				if (i == rows.length - 1)
					$("addBut_" + lastId).style.visibility = "visible";
				else
					$("addBut_" + lastId).style.visibility = "hidden";
			}
		}
	}, 
	
	switchMode : function(askFlag) {
		var display = "none";
		if ($("switchBut").innerHTML == comQuery.resource.res2) {
			$("switchBut").innerHTML = comQuery.resource.res1;
			$("conditionTable").style.width = 580 + comQuery.fieldColWidth + "px";
			$("buttomBar").style.width = 580 + comQuery.fieldColWidth + "px";
			display = "";
		} else {
			if (askFlag) {
				if (!confirm(comQuery.resource.res41)) {
					return;
				}
			} 
			$("switchBut").innerHTML = comQuery.resource.res2;
			$("conditionTable").style.width = 410 + comQuery.fieldColWidth + "px";
			$("buttomBar").style.width = 410 + comQuery.fieldColWidth + "px";
			
			for (var i=0; i<100; i++) {
				try {
					$("left_" + i).value = "";
					$("right_" + i).value = "";
					$("logic_" + i).value = "and";
				} catch(e) {}
			}
		}
		
		var rows = $('conditionTable').rows;
		for (var i=0; i<rows.length; i++) {
			var cells = rows[i].cells;
			cells[0].style.display = display;
			cells[4].style.display = display;
			cells[5].style.display = display;
		}		
	},
	getDBConst : function(value, datatype) {
		var dbType = comQuery.dbType;
		if (value.length == 0) {
			return "";
		}
		switch (datatype) {
		  case 0:
			return comQuery.getCharConst(value);
		  case 1:
			return value;
		  case 2:
			if (dbType == "1") {
				return "to_date( '" + value + "', 'yyyy-mm-dd' )";
			} else {
				return "'" + value + "'";
			}
		  case 4:  // 4
			if (dbType == "1") {
				return "to_date( '" + value + "', 'hh24:mi:ss' )";
			} else {
				return "'" + value + "'";
			}
		  case 3: // 5
			if (dbType == "1") {
				return "to_date( '" + value + "', 'yyyy-mm-dd hh24:mi:ss' )";
			} else {
				return "'" + value + "'";
			}
		  default:
			return value;
		}
	},
	getCharConst : function(value) {
		var dbType = comQuery.dbType;
		var quote = "'";
		if (dbType == "5" || dbType == "6" || dbType == "7" || dbType == "8") {
			quote = "'";
		}
		var len = value.length;
		var s = quote;
		for (var i = 0; i < len; i++) {
			var ch = value.charAt(i);
			if (ch == quote) {
				s += ch;
			}
			s += ch;
		}
		s += quote;
		return s;
	}
}

function $(id) {
	return document.getElementById(id);
}

String.prototype.trim=function(){
	return this.replace(/^\s+/, '').replace(/\s+$/, '');
}

String.prototype.replaceAll=function(v1, v2){
	var result = this;
	while (result.indexOf(v1) != -1) {
		result = result.replace(v1, v2);
	}
	return result;
}


