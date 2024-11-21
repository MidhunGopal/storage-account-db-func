const { app } = require('@azure/functions');
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
app.http('RetrieveData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const accountName = process.env.STORAGE_ACCOUNT_NAME;
        const accountKey = process.env.STORAGE_ACCOUNT_KEY;
        const tableName = "piiData";
        const credential = new AzureNamedKeyCredential(accountName, accountKey);
        const tableClient = new TableClient(`https://${accountName}.table.core.windows.net`, tableName, credential);
        const parts =  request.query.toString().split('=');
        const blobName = parts[1];
              
        try {
            if (blobName) {
                // Retrieve specific row by blobName 
                const entity = await tableClient.getEntity('partition1', blobName);
                context.log('Entity retrieved successfully for'+blobName);
                return {
                    status: 200,
                    body: JSON.stringify(entity),
                    contentType: 'application/json'
                }
            } else {
                // Retrieve all rows 
                const entities = []; 
                for await (const entity of tableClient.listEntities()) {
                    entities.push(entity);
                }
                context.log('Entity retrieved successfully.');
                return {
                    status: 200,
                    body: JSON.stringify(entities),
                    contentType: 'application/json'
                }
            }
        } catch (error) {
            context.log('Error retrieving entity:', error.message);
            return {
                status: 500,
                body: JSON.stringify({ message: "Error retrieving data: " + error.message }),
                contentType: 'application/json'
            }
        }
    }
});
