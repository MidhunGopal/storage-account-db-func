const { app } = require('@azure/functions');
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const { v4: uuidv4 } = require('uuid');
app.http('SaveData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const accountName = process.env.STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.STORAGE_ACCOUNT_KEY;
        const tableName = "piiData";
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(`https://${accountName}.table.core.windows.net`, tableName, credential);
        // Ensure required properties are set 
        const requestBodyJson = await request.json();
        const entity = {
            partitionKey: requestBodyJson.partitionKey || 'documentPartition',
            rowKey: uuidv4(),
            piiData: requestBodyJson.piiData || '',
            fileReference: requestBodyJson.fileReference || ''
        };
        try {
            await tableClient.createEntity(entity);
            context.log('Entity saved successfully.');
            return {
                status: 200,
                body: "Data saved successfully.",
                contentType: 'application/json'
            };
        } catch (error) {
            context.log('Error saving entity:', error.message);
            return {
                status: 500,
                body: JSON.stringify({ message: "Error saving data: " + error.message }),
                contentType: 'application/json'
            }
        }
    }
});
