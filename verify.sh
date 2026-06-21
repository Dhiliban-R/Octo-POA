#!/bin/bash
# Octo-POA Automatic Verification Script
# Run: bash verify.sh

set -e

echo "=========================================="
echo "Octo-POA Pre-Launch Verification"
echo "=========================================="
echo "Started at: $(date)"
echo ""

OCTO="node bin/octo.js"

# Phase 1: Module Alignment
echo "Phase 1: Module Alignment"
echo "------------------------------------------"
$OCTO graph-scan 2>&1 | grep -E "Scanned|Found|files"
$OCTO query "what are the main modules?" 2>&1 | grep -E "results|files"
$OCTO gateway-status 2>&1 | head -5
echo "✓ Module alignment check complete"
echo ""

# Phase 2: Context Awareness
echo "Phase 2: Context Awareness"
echo "------------------------------------------"
$OCTO remember "Project: Octo-POA v1.0.0" 2>&1 | grep -E "Stored|observation"
$OCTO remember "Modules: planning, execution, memory, knowledge, gateway, workflow" 2>&1 | grep -E "Stored|observation"
$OCTO remember "CLI: 22 commands, MCP: 20 tools" 2>&1 | grep -E "Stored|observation"
$OCTO recall "what is Octo-POA?" 2>&1 | grep -E "results|Octo-POA"
$OCTO recall "what modules exist?" 2>&1 | grep -E "results|modules"
echo "✓ Context awareness check complete"
echo ""

# Phase 3: Security Risks
echo "Phase 3: Security Risks"
echo "------------------------------------------"
$OCTO query "find potential security risks" 2>&1 | grep -E "results|risks"
$OCTO query "find API keys or secrets" 2>&1 | grep -E "results|secrets"
$OCTO query "find hardcoded passwords" 2>&1 | grep -E "results|passwords"
echo "✓ Security risk check complete"
echo ""

# Phase 4: Operation Workflows
echo "Phase 4: Operation Workflows"
echo "------------------------------------------"
WORKFLOW_OUTPUT=$($OCTO workflow-start "Verification" "Pre-launch verification" 2>&1)
WORKFLOW_ID=$(echo "$WORKFLOW_OUTPUT" | grep -o "Verification-[a-z0-9]*" | head -1)
echo "Created workflow: $WORKFLOW_ID"

if [ -n "$WORKFLOW_ID" ]; then
    $OCTO workflow-check "$WORKFLOW_ID" execution 2>&1 | grep -E "blocked|allowed"
    $OCTO workflow-todo "$WORKFLOW_ID" "Verify all tests pass" 2>&1 | grep -E "Added"
    $OCTO workflow-todo "$WORKFLOW_ID" "Check security vulnerabilities" 2>&1 | grep -E "Added"
    $OCTO workflow-complete "$WORKFLOW_ID" planning --signoff 2>&1 | grep -E "completed"
    $OCTO workflow-check "$WORKFLOW_ID" execution 2>&1 | grep -E "blocked|allowed"
fi
echo "✓ Operation workflows check complete"
echo ""

# Phase 5: Code Improvements
echo "Phase 5: Code Improvements"
echo "------------------------------------------"
$OCTO query "find code duplication" 2>&1 | grep -E "results|duplication"
$OCTO query "check function complexity" 2>&1 | grep -E "results|complexity"
$OCTO query "find performance bottlenecks" 2>&1 | grep -E "results|performance"
echo "✓ Code improvements check complete"
echo ""

# Phase 6: Test Verification
echo "Phase 6: Test Verification"
echo "------------------------------------------"
echo "Running unit tests..."
npm run test:unit 2>&1 | tail -3

echo "Running integration tests..."
npm test 2>&1 | tail -5

echo "Running linting..."
npm run lint 2>&1 | tail -3
echo "✓ Test verification complete"
echo ""

# Summary
echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo "Completed at: $(date)"
echo ""
echo "Next steps:"
echo "1. Review results above"
echo "2. Fix any issues found"
echo "3. Proceed to npm publish"
echo "4. Create GitHub release"
