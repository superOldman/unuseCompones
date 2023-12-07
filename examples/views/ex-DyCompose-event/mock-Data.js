export const mockData = {
    "templateType": 1,
    "eventConditionTemplateName": "snl-组件库使用",
    "baccountType": 0,
    "projectType": 3,
    "description": "",
    "bcompanySequence": "yfbcss001",
    "type": 2,
    "userArr": [
        {
            "eventPropertyConditionGroupDTOs": [
                {
                    "eventPropertyConditionDTOs": [
                        {
                            "eventPropertyValue": [
                                "12"
                            ],
                            "eventFilterCode": "CONTAIN",
                            "eventPropertyCode": {
                                "uniqueValue": "1_$gpush_client_id",
                                "name": "个推id",
                                "nameEn": "$gpush_client_id",
                                "type": "FIELD",
                                "fieldType": "STRING",
                                "parentId": 1
                            },
                            
                            "eventFieldType": "STRING",
                            "type": "FIELD"
                        },
                        {
                            "eventPropertyValue": [
                                "12"
                            ],
                            "eventFilterCode": "CONTAIN",
                            "eventPropertyCode": {
                                "uniqueValue": "1_$jpush_register_id",
                                "name": "极光id",
                                "nameEn": "$jpush_register_id",
                                "type": "FIELD",
                                "fieldType": "STRING",
                                "parentId": 1
                            },
                            
                            "eventFieldType": "STRING",
                            "type": "FIELD"
                        }
                    ],
                    "conditionType": 0
                },
                {
                    "eventPropertyConditionDTOs": [
                        {
                            "eventPropertyValue": [
                                "12"
                            ],
                            "eventFilterCode": "CONTAIN",
                            "eventPropertyCode": {
                                "uniqueValue": "1_$jpush_register_id",
                                "name": "极光id",
                                "nameEn": "$jpush_register_id",
                                "type": "FIELD",
                                "fieldType": "STRING",
                                "parentId": 1
                            },
                            "eventFieldType": "STRING",
                            "type": "FIELD"
                        },
                        {
                            "eventPropertyValue": [
                                "12"
                            ],
                            "eventFilterCode": "CONTAIN",
                            "eventPropertyCode": {
                                "uniqueValue": "1_$jpush_register_id",
                                "name": "极光id",
                                "nameEn": "$jpush_register_id",
                                "type": "FIELD",
                                "fieldType": "STRING",
                                "parentId": 1
                            },
                            "eventFieldType": "STRING",
                            "type": "FIELD"
                        }
                    ],
                    "conditionType": 0
                },
                {
                    "eventPropertyConditionDTOs": [
                        {
                            "eventPropertyValue": [
                                "12"
                            ],
                            "eventFilterCode": "CONTAIN",
                            "eventPropertyCode": {
                                "uniqueValue": "1_$email",
                                "name": "邮箱号",
                                "nameEn": "$email",
                                "type": "FIELD",
                                "fieldType": "STRING",
                                "parentId": 1
                            },
                            "eventFieldType": "STRING",
                            "type": "FIELD"
                        }
                    ],
                    "conditionType": 0
                }
            ],
            "conditionType": 0
        }
    ],
    "demo": false,
    "bcompanyId": 2184389,
    "bloginName": "yfbcss001",
    "productCode": 10001,
    "dbId": 2760,
    "bid": 2184389,
    "projectId": 2760,
    "tradeId": 0,
    "eventConditionGroupDTO": {
        "eventConditionDTOs": [
            {
                "eventActionCode": {
                    "uniqueValue": "$AppClick",
                    "name": "App 元素点击",
                    "eventType": 1,
                    "nameEn": "$AppClick"
                },
                "eventActionIndicatorCode": "100001",
                "eventPropertyConditionGroupDTOs": [
                    {
                        "eventPropertyConditionDTOs": [
                            {
                                "eventPropertyValue": [
                                    "0af06afd-797c-4816-ba18-a3070a1203d8"
                                ],
                                "eventFilterCode": "EQUAL",
                                "eventPropertyCode": {
                                    "uniqueValue": "4_$app_id",
                                    "name": "应用唯一标识",
                                    "nameEn": "$app_id",
                                    "sort": 0,
                                    "ckColumn": "value_string",
                                    "type": "EVENT",
                                    "fieldType": "STRING",
                                    "parentId": 4
                                },
                                "eventFieldType": "STRING",
                                "ckColumn": "value_string",
                                "type": "EVENT"
                            },
                            {
                                "eventPropertyValue": [
                                    "12"
                                ],
                                "eventFilterCode": "EQUAL",
                                "eventPropertyCode": {
                                    "uniqueValue": "4_$app_id",
                                    "name": "应用唯一标识",
                                    "nameEn": "$app_id",
                                    "sort": 0,
                                    "ckColumn": "value_string",
                                    "type": "EVENT",
                                    "fieldType": "STRING",
                                    "parentId": 4
                                },
                                "eventFieldType": "STRING",
                                "ckColumn": "value_string",
                                "type": "EVENT"
                            }
                        ],
                        "conditionType": 0
                    },
                    {
                        "eventPropertyConditionDTOs": [
                            {
                                "eventPropertyValue": [
                                    "1"
                                ],
                                "eventFilterCode": "EQUAL",
                                "eventPropertyCode": {
                                    "uniqueValue": "4_$app_id",
                                    "name": "应用唯一标识",
                                    "nameEn": "$app_id",
                                    "sort": 0,
                                    "ckColumn": "value_string",
                                    "type": "EVENT",
                                    "fieldType": "STRING",
                                    "parentId": 4
                                },
                                "eventFieldType": "STRING",
                                "ckColumn": "value_string",
                                "type": "EVENT"
                            }
                        ]
                    }
                ],
                "conditionName": "任意事件",
                "conditionType": 0,
                "step": 0
            },
            {
                "eventActionCode": {
                    "uniqueValue": "$AppClick",
                    "name": "App 元素点击",
                    "eventType": 1,
                    "nameEn": "$AppClick"
                },
                "eventActionIndicatorCode": "100003",
                "eventPropertyConditionGroupDTOs": [],
                "conditionName": "任意事件1",
                "conditionType": 0,
                "step": 1
            }
        ]
    }
}
